using Hangfire;
using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;

namespace MovieSocial.Api.Services;

/// <summary>Stub transcode: marks the uploaded <see cref="Models.Entities.VideoSource"/> as ready (replace with FFmpeg when available).</summary>
public class TranscodeProcessor(
    IServiceScopeFactory scopeFactory,
    IBackgroundJobClient jobs,
    ILogger<TranscodeProcessor> log)
{
    public async Task ProcessVideoSourceAsync(Guid videoSourceId)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var vs = await db.VideoSources.FirstOrDefaultAsync(v => v.Id == videoSourceId).ConfigureAwait(false);
        if (vs is null)
        {
            log.LogWarning("Transcode: VideoSource {Id} missing", videoSourceId);
            return;
        }

        var wasNotReady = !string.Equals(vs.Status, "ready", StringComparison.OrdinalIgnoreCase);
        var chapterId = vs.ChapterId;

        vs.Status = "ready";
        vs.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync().ConfigureAwait(false);
        log.LogInformation("Transcode stub: VideoSource {Id} marked ready", videoSourceId);

        if (!wasNotReady) return;

        var alreadyAnnounced = await db.Notifications.AsNoTracking()
            .AnyAsync(n => n.Type == "new_episode" && n.ReferenceId == chapterId)
            .ConfigureAwait(false);
        if (alreadyAnnounced) return;

        var ch = await db.Chapters.AsNoTracking()
            .Include(c => c.Movie)
            .FirstOrDefaultAsync(c => c.Id == chapterId)
            .ConfigureAwait(false);
        if (ch is null) return;
        if (!string.Equals(ch.Movie.Status, "published", StringComparison.OrdinalIgnoreCase)) return;

        jobs.Enqueue<NewEpisodeNotificationService>(s => s.FanOutNewEpisodeAsync(ch.MovieId, ch.Id));
    }
}
