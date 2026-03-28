using Hangfire;
using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

/// <summary>M9: fan-out in-app notifications when a published episode becomes playable (first VideoSource ready).</summary>
public class NewEpisodeNotificationService(
    AppDbContext db,
    PushNotificationService push,
    ILogger<NewEpisodeNotificationService> log)
{
    [AutomaticRetry(Attempts = 2)]
    public async Task FanOutNewEpisodeAsync(Guid movieId, Guid chapterId)
    {
        var movie = await db.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.Id == movieId).ConfigureAwait(false);
        if (movie is null || !string.Equals(movie.Status, "published", StringComparison.OrdinalIgnoreCase))
            return;

        var chapter = await db.Chapters.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == chapterId && c.MovieId == movieId)
            .ConfigureAwait(false);
        if (chapter is null) return;

        var buyerIds = await db.Purchases.AsNoTracking()
            .Where(p => p.MovieId == movieId && p.Status == "completed")
            .Select(p => p.UserId)
            .ToListAsync()
            .ConfigureAwait(false);

        List<Guid> followerIds = [];
        if (!EntitlementService.IsPaidListing(movie))
        {
            followerIds = await db.MovieFollows.AsNoTracking()
                .Where(f => f.MovieId == movieId)
                .Select(f => f.UserId)
                .ToListAsync()
                .ConfigureAwait(false);
        }

        var recipients = buyerIds.Concat(followerIds).Distinct().ToList();
        if (recipients.Count == 0) return;

        var existingList = await db.Notifications.AsNoTracking()
            .Where(n => n.Type == "new_episode" && n.ReferenceId == chapterId && recipients.Contains(n.UserId))
            .Select(n => n.UserId)
            .ToListAsync()
            .ConfigureAwait(false);
        var existing = existingList.ToHashSet();

        var title = "Tập mới";
        var body = $"{movie.Title}: «{chapter.Title}» đã có thể xem.";
        var now = DateTime.UtcNow;
        var newUserIds = new List<Guid>();
        foreach (var uid in recipients)
        {
            if (existing.Contains(uid)) continue;
            newUserIds.Add(uid);
            db.Notifications.Add(new Notification
            {
                UserId           = uid,
                Type             = "new_episode",
                Title            = title,
                Body             = body,
                ReferenceId      = chapterId,
                ReferenceMovieId = movieId,
                CreatedAt        = now,
                UpdatedAt        = now,
            });
        }

        await db.SaveChangesAsync().ConfigureAwait(false);
        log.LogInformation("M9 new_episode fan-out: movie {MovieId} chapter {ChapterId}, recipients {Count}",
            movieId, chapterId, recipients.Count);

        if (newUserIds.Count > 0 && push.IsConfigured)
            await push.SendNewEpisodeToUsersAsync(newUserIds, movieId, chapterId, title, body).ConfigureAwait(false);
    }
}
