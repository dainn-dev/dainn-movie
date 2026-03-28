using Hangfire;
using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class VideoUploadService(
    AppDbContext db,
    StreamUrlService streamUrls,
    UploadRateLimitService rateLimit,
    IBackgroundJobClient jobs,
    ILogger<VideoUploadService> log)
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska",
    };

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".mp4", ".mov", ".avi", ".mkv",
    };

    public async Task<(VideoPresignResponse? Dto, string? Error, int Status)> PresignAsync(
        VideoPresignRequest req, Guid userId)
    {
        if (!AllowedContentTypes.Contains(req.ContentType.Trim()))
            return (null, "Content-Type video không được hỗ trợ.", 400);

        var built = BuildObjectKey(req.MovieId, req.ChapterId, req.Filename);
        if (built.Error is not null) return (null, built.Error, 400);
        var key = built.Key!;

        var movie = await db.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.Id == req.MovieId);
        if (movie is null) return (null, "Phim không tồn tại.", 404);
        if (movie.UploadedById != userId) return (null, "Không có quyền.", 403);

        var chapter = await db.Chapters.AsNoTracking().FirstOrDefaultAsync(c => c.Id == req.ChapterId);
        if (chapter is null || chapter.MovieId != req.MovieId)
            return (null, "Chapter không hợp lệ.", 400);

        var url = streamUrls.GetPresignedPutUrl(key, req.ContentType.Trim(), TimeSpan.FromMinutes(30));
        if (string.IsNullOrEmpty(url))
            return (null, "Cấu hình R2 thiếu — không thể tạo URL tải lên.", 503);

        var (allowed, rateErr) = await rateLimit.TryConsumeAsync(userId).ConfigureAwait(false);
        if (!allowed)
            return (null, rateErr, 429);

        var exp = DateTime.UtcNow.AddMinutes(30);
        log.LogInformation("Presigned PUT for user {User}, key prefix videos/{Movie}/...", userId, req.MovieId);
        return (new VideoPresignResponse(url, key, exp), null, 200);
    }

    public async Task<(VideoConfirmResponse? Dto, string? Error, int Status)> ConfirmAsync(
        VideoConfirmRequest req, Guid userId)
    {
        if (!AllowedContentTypes.Contains(req.ContentType.Trim()))
            return (null, "Content-Type video không được hỗ trợ.", 400);

        if (req.FileSizeBytes <= 0 || req.FileSizeBytes > 6L * 1024 * 1024 * 1024)
            return (null, "Kích thước file không hợp lệ.", 400);

        var expectedPrefix = $"videos/{req.MovieId}/{req.ChapterId}/";
        if (!req.Key.StartsWith(expectedPrefix, StringComparison.Ordinal))
            return (null, "Key object không khớp phim/chapter.", 400);

        var movie = await db.Movies.FirstOrDefaultAsync(m => m.Id == req.MovieId);
        if (movie is null) return (null, "Phim không tồn tại.", 404);
        if (movie.UploadedById != userId) return (null, "Không có quyền.", 403);

        var chapter = await db.Chapters.FirstOrDefaultAsync(c => c.Id == req.ChapterId);
        if (chapter is null || chapter.MovieId != req.MovieId)
            return (null, "Chapter không hợp lệ.", 400);

        var old = await db.VideoSources.Where(v => v.ChapterId == req.ChapterId).ToListAsync();
        if (old.Count > 0)
            db.VideoSources.RemoveRange(old);

        var vs = new VideoSource
        {
            ChapterId    = req.ChapterId,
            Quality      = "HD",
            R2Key        = req.Key,
            FileSizeBytes = req.FileSizeBytes,
            Status       = "processing",
        };
        db.VideoSources.Add(vs);
        await db.SaveChangesAsync();

        jobs.Enqueue<TranscodeProcessor>(p => p.ProcessVideoSourceAsync(vs.Id));
        return (new VideoConfirmResponse(vs.Id), null, 200);
    }

    private static (string? Key, string? Error) BuildObjectKey(Guid movieId, Guid chapterId, string filename)
    {
        var baseName = Path.GetFileName(filename);
        if (string.IsNullOrWhiteSpace(baseName))
            return (null, "Tên file không hợp lệ.");

        var ext = Path.GetExtension(baseName);
        if (!AllowedExtensions.Contains(ext))
            return (null, "Phần mở rộng file không được hỗ trợ.");

        return ($"videos/{movieId}/{chapterId}/original{ext}", null);
    }
}
