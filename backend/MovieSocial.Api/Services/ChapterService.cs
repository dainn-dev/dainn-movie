using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class ChapterService(AppDbContext db, StreamUrlService streamUrls, EntitlementService entitlements)
{
    public async Task<List<ChapterSummaryDto>> ListForMovieAsync(Guid movieId, Guid? viewerId, string? viewerRole)
    {
        var movie = await db.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.Id == movieId);
        if (movie is null) return [];

        var canManage = string.Equals(viewerRole, "admin", StringComparison.Ordinal)
            || (viewerId.HasValue && movie.UploadedById == viewerId);
        if (movie.Status != "published" && !canManage)
            return [];

        return await db.Chapters.AsNoTracking()
            .Where(c => c.MovieId == movieId)
            .OrderBy(c => c.Order)
            .Select(c => new ChapterSummaryDto(
                c.Id, c.Title, c.Order, c.DurationSeconds, c.ThumbnailUrl,
                c.IntroSkipEndSeconds,
                c.SubtitleR2Key != null && c.SubtitleR2Key != "",
                c.VideoSources
                    .OrderBy(v => v.Quality)
                    .Select(v => new VideoSourceInfoDto(v.Id, v.Quality, v.Status, v.StreamEndpoints.Count))))
            .ToListAsync();
    }

    public async Task<List<VideoSourceInfoDto>> ListSourcesAsync(Guid chapterId)
    {
        return await db.VideoSources.AsNoTracking()
            .Where(v => v.ChapterId == chapterId)
            .OrderBy(v => v.Quality)
            .Select(v => new VideoSourceInfoDto(v.Id, v.Quality, v.Status, v.StreamEndpoints.Count))
            .ToListAsync();
    }

    public async Task<StreamUrlGate> GetStreamUrlGateAsync(
        Guid chapterId, string? qualityParam, Guid? viewerId, string? viewerRole)
    {
        var chapter = await db.Chapters.AsNoTracking()
            .Include(c => c.Movie)
            .Include(c => c.VideoSources)
            .FirstOrDefaultAsync(c => c.Id == chapterId);

        if (chapter is null) return new StreamUrlGate(null, 404, null);

        var published = string.Equals(chapter.Movie.Status, "published", StringComparison.OrdinalIgnoreCase);
        if (published)
        {
            if (!await entitlements.CanWatchPublishedStreamAsync(viewerId, viewerRole, chapter.Movie))
            {
                if (viewerId is null) return new StreamUrlGate(null, 401, chapter.MovieId);
                return new StreamUrlGate(null, 403, chapter.MovieId);
            }
        }
        else if (!CanManageUnpublishedMovie(chapter.Movie, viewerId, viewerRole))
        {
            return new StreamUrlGate(null, 404, null);
        }

        var want = MapQuality(qualityParam);
        var ready = chapter.VideoSources.Where(v => v.Status == "ready").ToList();

        var source = ready.FirstOrDefault(v =>
                string.Equals(v.Quality, want, StringComparison.OrdinalIgnoreCase))
            ?? ready.FirstOrDefault(v =>
                string.Equals(v.Quality, qualityParam?.Trim(), StringComparison.OrdinalIgnoreCase))
            ?? ready.OrderBy(v => v.Quality).FirstOrDefault();

        if (source is null) return new StreamUrlGate(null, 404, null);
        var url = await ResolvePlaybackUrlAsync(source.Id, source.R2Key).ConfigureAwait(false);
        return url is null ? new StreamUrlGate(null, 404, null) : new StreamUrlGate(url, 200, null);
    }

    /// <summary>Ưu tiên các <see cref="VideoSourceEndpoint"/> (SortOrder), sau đó R2Key gốc của VideoSource.</summary>
    private async Task<string?> ResolvePlaybackUrlAsync(Guid videoSourceId, string primaryR2Key)
    {
        var endpoints = await db.VideoSourceEndpoints.AsNoTracking()
            .Where(e => e.VideoSourceId == videoSourceId)
            .OrderBy(e => e.SortOrder)
            .ThenBy(e => e.CreatedAt)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var ep in endpoints)
        {
            if (!string.IsNullOrWhiteSpace(ep.DirectUrl))
                return ep.DirectUrl.Trim();
            if (!string.IsNullOrWhiteSpace(ep.R2Key))
            {
                var u = streamUrls.GetStreamUrl(ep.R2Key.Trim());
                if (u is not null) return u;
            }
        }

        return streamUrls.GetStreamUrl(primaryR2Key);
    }

    public async Task<StreamUrlGate> GetSubtitleUrlGateAsync(Guid chapterId, Guid? viewerId, string? viewerRole)
    {
        var chapter = await db.Chapters.AsNoTracking()
            .Include(c => c.Movie)
            .FirstOrDefaultAsync(c => c.Id == chapterId);

        if (chapter is null) return new StreamUrlGate(null, 404, null);

        var published = string.Equals(chapter.Movie.Status, "published", StringComparison.OrdinalIgnoreCase);
        if (published)
        {
            if (!await entitlements.CanWatchPublishedStreamAsync(viewerId, viewerRole, chapter.Movie))
            {
                if (viewerId is null) return new StreamUrlGate(null, 401, chapter.MovieId);
                return new StreamUrlGate(null, 403, chapter.MovieId);
            }
        }
        else if (!CanManageUnpublishedMovie(chapter.Movie, viewerId, viewerRole))
        {
            return new StreamUrlGate(null, 404, null);
        }

        if (string.IsNullOrWhiteSpace(chapter.SubtitleR2Key)) return new StreamUrlGate(null, 404, null);
        var url = streamUrls.GetStreamUrl(chapter.SubtitleR2Key);
        return url is null ? new StreamUrlGate(null, 404, null) : new StreamUrlGate(url, 200, null);
    }

    public async Task<(ChapterCreatedDto? dto, string? error)> CreateAsync(
        Guid movieId, CreateChapterRequest req, Guid userId, string role)
    {
        var movie = await db.Movies.FindAsync(movieId);
        if (movie is null) return (null, "Phim không tồn tại.");
        if (role != "admin" && movie.UploadedById != userId)
            return (null, "Không có quyền thêm chapter.");

        var ch = new Chapter
        {
            MovieId               = movieId,
            Title                 = req.Title,
            Order                 = req.Order,
            DurationSeconds       = req.DurationSeconds,
            ThumbnailUrl          = req.ThumbnailUrl,
            IntroSkipEndSeconds   = req.IntroSkipEndSeconds,
            SubtitleR2Key         = string.IsNullOrWhiteSpace(req.SubtitleR2Key) ? null : req.SubtitleR2Key.Trim(),
        };
        db.Chapters.Add(ch);
        await db.SaveChangesAsync();
        return (new ChapterCreatedDto(ch.Id, ch.Title, ch.Order), null);
    }

    public async Task<(ChapterCreatedDto? dto, string? error)> UpdateAsync(
        Guid chapterId, UpdateChapterRequest req, Guid userId, string role)
    {
        var ch = await db.Chapters.Include(c => c.Movie).FirstOrDefaultAsync(c => c.Id == chapterId);
        if (ch is null) return (null, "Chapter không tồn tại.");
        if (role != "admin" && ch.Movie.UploadedById != userId)
            return (null, "Không có quyền sửa chapter.");

        if (req.Title is not null) ch.Title = req.Title;
        if (req.Order is not null) ch.Order = req.Order.Value;
        if (req.DurationSeconds is not null) ch.DurationSeconds = req.DurationSeconds;
        if (req.ThumbnailUrl is not null) ch.ThumbnailUrl = req.ThumbnailUrl;
        if (req.IntroSkipEndSeconds is not null) ch.IntroSkipEndSeconds = req.IntroSkipEndSeconds;
        if (req.SubtitleR2Key is not null)
            ch.SubtitleR2Key = string.IsNullOrWhiteSpace(req.SubtitleR2Key) ? null : req.SubtitleR2Key.Trim();
        ch.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return (new ChapterCreatedDto(ch.Id, ch.Title, ch.Order), null);
    }

    public async Task<string?> DeleteAsync(Guid chapterId, Guid userId, string role)
    {
        var ch = await db.Chapters.Include(c => c.Movie).FirstOrDefaultAsync(c => c.Id == chapterId);
        if (ch is null) return "Chapter không tồn tại.";
        if (role != "admin" && ch.Movie.UploadedById != userId)
            return "Không có quyền xoá chapter.";
        db.Chapters.Remove(ch);
        await db.SaveChangesAsync();
        return null;
    }

    private static bool CanManageUnpublishedMovie(Movie movie, Guid? viewerId, string? viewerRole)
    {
        if (string.Equals(viewerRole, "admin", StringComparison.Ordinal)) return true;
        return viewerId.HasValue && movie.UploadedById == viewerId.Value;
    }

    /// <summary>Map query ?quality=720p to stored labels (SD/HD/4K or raw).</summary>
    private static string MapQuality(string? q)
    {
        if (string.IsNullOrWhiteSpace(q)) return "HD";
        return q.Trim().ToLowerInvariant() switch
        {
            "480p" or "sd"       => "SD",
            "720p" or "hd"       => "HD",
            "1080p" or "4k" or "2160p" => "4K",
            _                    => q.Trim(),
        };
    }
}
