using System.Diagnostics;
using System.Globalization;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

/// <summary>M4b: cắt video (FFmpeg), ảnh poster từ frame — cần R2 + ffmpeg trên PATH.</summary>
public class VideoProcessingService(
    AppDbContext db,
    StreamUrlService stream,
    IConfiguration cfg,
    IBackgroundJobClient jobs,
    ILogger<VideoProcessingService> log)
{
    private string FfmpegPath => cfg["VideoProcessing:FfmpegPath"] ?? "ffmpeg";

    public async Task<(bool Ok, string? Error)> TrimChapterAsync(Guid chapterId, Guid userId, double startSec, double endSec)
    {
        if (!stream.IsObjectStorageConfigured())
            return (false, "Cấu hình Cloudflare R2 chưa đủ — không thể xử lý video trên server.");

        if (startSec < 0 || endSec <= startSec)
            return (false, "Khoảng cắt không hợp lệ (end phải lớn hơn start, start ≥ 0).");

        var duration = endSec - startSec;
        if (duration > 8 * 3600)
            return (false, "Đoạn cắt quá dài (tối đa 8 giờ).");

        var chapter = await db.Chapters
            .Include(c => c.Movie)
            .Include(c => c.VideoSources)
            .FirstOrDefaultAsync(c => c.Id == chapterId)
            .ConfigureAwait(false);

        if (chapter is null) return (false, "Chapter không tồn tại.");
        if (chapter.Movie.UploadedById != userId) return (false, "Không có quyền.");

        var vs = chapter.VideoSources
            .OrderByDescending(v => v.CreatedAt)
            .FirstOrDefault();

        if (vs is null) return (false, "Chưa có video.");
        if (vs.Status != "ready")
            return (false, "Video chưa sẵn sàng — đợi xử lý xong rồi thử cắt lại.");

        var tempDir = Path.Combine(Path.GetTempPath(), "ms_trim_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(tempDir);
        try
        {
            var ext = Path.GetExtension(vs.R2Key);
            if (string.IsNullOrEmpty(ext)) ext = ".mp4";
            var srcPath = Path.Combine(tempDir, "src" + ext);
            var outPath = Path.Combine(tempDir, "out.mp4");

            if (!await stream.DownloadObjectToFileAsync(vs.R2Key, srcPath).ConfigureAwait(false))
                return (false, "Không tải được file gốc từ storage.");

            var startStr = startSec.ToString(CultureInfo.InvariantCulture);
            var durStr = duration.ToString(CultureInfo.InvariantCulture);
            var args = $"-y -ss {startStr} -i \"{srcPath}\" -t {durStr} -c:v libx264 -preset veryfast -crf 23 -c:a aac -movflags +faststart \"{outPath}\"";

            var (exit, err) = await RunFfmpegAsync(args).ConfigureAwait(false);
            if (exit != 0)
            {
                log.LogWarning("FFmpeg trim failed: {Err}", err);
                return (false, "FFmpeg không cắt được video (kiểm tra file nguồn và ffmpeg).");
            }

            var fi = new FileInfo(outPath);
            if (!fi.Exists || fi.Length < 1024)
                return (false, "File sau cắt không hợp lệ.");

            var newKey = $"videos/{chapter.MovieId}/{chapterId}/trim-{Guid.NewGuid():N}.mp4";
            if (!await stream.UploadFileAsync(newKey, outPath, "video/mp4").ConfigureAwait(false))
                return (false, "Upload video đã cắt thất bại.");

            vs.R2Key         = newKey;
            vs.FileSizeBytes = fi.Length;
            vs.Status        = "processing";
            vs.UpdatedAt     = DateTime.UtcNow;
            await db.SaveChangesAsync().ConfigureAwait(false);

            jobs.Enqueue<TranscodeProcessor>(p => p.ProcessVideoSourceAsync(vs.Id));
            return (true, null);
        }
        finally
        {
            try
            {
                Directory.Delete(tempDir, true);
            }
            catch
            {
                /* ignore */
            }
        }
    }

    public async Task<(bool Ok, string? Error, string? ThumbnailUrl)> CapturePosterFrameAsync(
        Guid chapterId, Guid userId, double timeSec)
    {
        if (!stream.IsObjectStorageConfigured())
            return (false, "Cấu hình Cloudflare R2 chưa đủ.", null);

        if (timeSec < 0)
            return (false, "Thời điểm không hợp lệ.", null);

        var chapter = await db.Chapters
            .Include(c => c.Movie)
            .Include(c => c.VideoSources)
            .FirstOrDefaultAsync(c => c.Id == chapterId)
            .ConfigureAwait(false);

        if (chapter is null) return (false, "Chapter không tồn tại.", null);
        if (chapter.Movie.UploadedById != userId) return (false, "Không có quyền.", null);

        var vs = chapter.VideoSources.OrderByDescending(v => v.CreatedAt).FirstOrDefault();
        if (vs is null) return (false, "Chưa có video.", null);
        if (vs.Status != "ready")
            return (false, "Video chưa sẵn sàng — đợi xử lý xong.", null);

        var tempDir = Path.Combine(Path.GetTempPath(), "ms_poster_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(tempDir);
        try
        {
            var ext = Path.GetExtension(vs.R2Key);
            if (string.IsNullOrEmpty(ext)) ext = ".mp4";
            var srcPath = Path.Combine(tempDir, "src" + ext);
            var jpgPath = Path.Combine(tempDir, "poster.jpg");

            if (!await stream.DownloadObjectToFileAsync(vs.R2Key, srcPath).ConfigureAwait(false))
                return (false, "Không tải được video từ storage.", null);

            var tStr = timeSec.ToString(CultureInfo.InvariantCulture);
            var args = $"-y -ss {tStr} -i \"{srcPath}\" -frames:v 1 -q:v 2 \"{jpgPath}\"";
            var (exit, err) = await RunFfmpegAsync(args).ConfigureAwait(false);
            if (exit != 0)
            {
                log.LogWarning("FFmpeg poster: {Err}", err);
                return (false, "Không trích xuất được khung hình.", null);
            }

            var fi = new FileInfo(jpgPath);
            if (!fi.Exists || fi.Length < 32)
                return (false, "Ảnh poster không hợp lệ.", null);

            var newKey = $"videos/{chapter.MovieId}/{chapterId}/poster-{Guid.NewGuid():N}.jpg";
            if (!await stream.UploadFileAsync(newKey, jpgPath, "image/jpeg").ConfigureAwait(false))
                return (false, "Upload poster thất bại.", null);

            var pub = stream.ResolvePublicBaseUrl();
            string? urlForDb;
            if (!string.IsNullOrWhiteSpace(pub))
                urlForDb = $"{pub}/{newKey}";
            else
                urlForDb = stream.GetStreamUrl(newKey);

            if (string.IsNullOrWhiteSpace(urlForDb))
                urlForDb = newKey;

            chapter.ThumbnailUrl = urlForDb;
            chapter.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync().ConfigureAwait(false);

            return (true, null, urlForDb);
        }
        finally
        {
            try
            {
                Directory.Delete(tempDir, true);
            }
            catch
            {
                /* ignore */
            }
        }
    }

    private async Task<(int ExitCode, string StdErr)> RunFfmpegAsync(string arguments)
    {
        var psi = new ProcessStartInfo
        {
            FileName               = FfmpegPath,
            Arguments              = arguments,
            RedirectStandardError  = true,
            RedirectStandardOutput = true,
            UseShellExecute        = false,
            CreateNoWindow         = true,
        };
        using var proc = new Process { StartInfo = psi };
        proc.Start();
        var err = await proc.StandardError.ReadToEndAsync().ConfigureAwait(false);
        _ = await proc.StandardOutput.ReadToEndAsync().ConfigureAwait(false);
        await proc.WaitForExitAsync().ConfigureAwait(false);
        return (proc.ExitCode, err);
    }
}
