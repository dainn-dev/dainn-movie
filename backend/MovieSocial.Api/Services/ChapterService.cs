using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class ChapterService(AppDbContext db, StreamUrlService streamUrls)
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
                c.VideoSources
                    .OrderBy(v => v.Quality)
                    .Select(v => new VideoSourceInfoDto(v.Id, v.Quality, v.Status))))
            .ToListAsync();
    }

    public async Task<List<VideoSourceInfoDto>> ListSourcesAsync(Guid chapterId)
    {
        return await db.VideoSources.AsNoTracking()
            .Where(v => v.ChapterId == chapterId)
            .OrderBy(v => v.Quality)
            .Select(v => new VideoSourceInfoDto(v.Id, v.Quality, v.Status))
            .ToListAsync();
    }

    public async Task<string?> GetStreamUrlAsync(Guid chapterId, string? qualityParam)
    {
        var chapter = await db.Chapters.AsNoTracking()
            .Include(c => c.Movie)
            .Include(c => c.VideoSources)
            .FirstOrDefaultAsync(c => c.Id == chapterId && c.Movie.Status == "published");

        if (chapter is null) return null;

        var want = MapQuality(qualityParam);
        var ready = chapter.VideoSources.Where(v => v.Status == "ready").ToList();

        var source = ready.FirstOrDefault(v =>
                string.Equals(v.Quality, want, StringComparison.OrdinalIgnoreCase))
            ?? ready.FirstOrDefault(v =>
                string.Equals(v.Quality, qualityParam?.Trim(), StringComparison.OrdinalIgnoreCase))
            ?? ready.OrderBy(v => v.Quality).FirstOrDefault();

        if (source is null) return null;
        return streamUrls.GetStreamUrl(source.R2Key);
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
            MovieId          = movieId,
            Title            = req.Title,
            Order            = req.Order,
            DurationSeconds  = req.DurationSeconds,
            ThumbnailUrl     = req.ThumbnailUrl,
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
