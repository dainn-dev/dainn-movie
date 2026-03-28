using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;

namespace MovieSocial.Api.Services;

/// <summary>Stub transcode: marks the uploaded <see cref="Models.Entities.VideoSource"/> as ready (replace with FFmpeg when available).</summary>
public class TranscodeProcessor(IServiceScopeFactory scopeFactory, ILogger<TranscodeProcessor> log)
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

        vs.Status = "ready";
        vs.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync().ConfigureAwait(false);
        log.LogInformation("Transcode stub: VideoSource {Id} marked ready", videoSourceId);
    }
}
