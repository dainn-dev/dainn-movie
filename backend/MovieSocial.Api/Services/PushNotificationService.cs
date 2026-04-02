using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Options;
using WebPush;
using PushSubEntity = MovieSocial.Api.Models.Entities.PushSubscription;

namespace MovieSocial.Api.Services;

/// <summary>M9-T10: lưu subscription + gửi Web Push (VAPID).</summary>
public class PushNotificationService(
    AppDbContext db,
    IOptions<WebPushOptions> options,
    ILogger<PushNotificationService> log)
{
    private const int MaxConcurrentPushSends = 16;
    private readonly WebPushOptions _opt = options.Value;

    public bool IsConfigured => _opt.IsConfigured;

    public string? PublicKey => _opt.IsConfigured ? _opt.PublicKey.Trim() : null;

    public async Task SaveSubscriptionAsync(Guid userId, SavePushSubscriptionRequest req, CancellationToken ct = default)
    {
        var endpoint = req.Endpoint.Trim();
        var p256 = req.Keys.P256dh.Trim();
        var auth = req.Keys.Auth.Trim();
        if (endpoint.Length < 10 || p256.Length < 10 || auth.Length < 10)
            return;

        var existing = await db.PushSubscriptions
            .FirstOrDefaultAsync(s => s.Endpoint == endpoint, ct)
            .ConfigureAwait(false);

        var now = DateTime.UtcNow;
        if (existing is not null)
        {
            existing.UserId = userId;
            existing.P256dh = p256;
            existing.Auth = auth;
            existing.UpdatedAt = now;
        }
        else
        {
            db.PushSubscriptions.Add(new PushSubEntity
            {
                UserId    = userId,
                Endpoint  = endpoint,
                P256dh    = p256,
                Auth      = auth,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        await db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task RemoveAllForUserAsync(Guid userId, CancellationToken ct = default)
    {
        await db.PushSubscriptions
            .Where(s => s.UserId == userId)
            .ExecuteDeleteAsync(ct)
            .ConfigureAwait(false);
    }

    public async Task RemoveByEndpointAsync(Guid userId, string endpoint, CancellationToken ct = default)
    {
        var ep = endpoint.Trim();
        await db.PushSubscriptions
            .Where(s => s.UserId == userId && s.Endpoint == ep)
            .ExecuteDeleteAsync(ct)
            .ConfigureAwait(false);
    }

    public async Task SendNewEpisodeToUsersAsync(
        IReadOnlyList<Guid> userIds,
        Guid movieId,
        Guid chapterId,
        string title,
        string body,
        CancellationToken ct = default)
    {
        if (!_opt.IsConfigured || userIds.Count == 0) return;

        var subs = await db.PushSubscriptions.AsNoTracking()
            .Where(s => userIds.Contains(s.UserId))
            .ToListAsync(ct)
            .ConfigureAwait(false);
        if (subs.Count == 0) return;

        var vapid = new VapidDetails(_opt.Subject.Trim(), _opt.PublicKey.Trim(), _opt.PrivateKey.Trim());
        var url = $"/watch/{movieId}/{chapterId}";
        var payload = JsonSerializer.Serialize(new { title, body, url });

        using var client = new WebPushClient();
        var staleIds = new ConcurrentBag<Guid>();
        var semaphore = new SemaphoreSlim(MaxConcurrentPushSends, MaxConcurrentPushSends);

        try
        {
            var tasks = subs.Select(async s =>
            {
                await semaphore.WaitAsync(ct).ConfigureAwait(false);
                try
                {
                    ct.ThrowIfCancellationRequested();
                    var pushSub = new PushSubscription(s.Endpoint, s.P256dh, s.Auth);
                    try
                    {
                        await client.SendNotificationAsync(pushSub, payload, vapid).ConfigureAwait(false);
                    }
                    catch (WebPushException ex)
                    {
                        if (ex.StatusCode is HttpStatusCode.Gone or HttpStatusCode.NotFound)
                            staleIds.Add(s.Id);
                        else
                            log.LogWarning(ex, "Web Push failed for subscription {Id}", s.Id);
                    }
                    catch (Exception ex)
                    {
                        log.LogWarning(ex, "Web Push error for subscription {Id}", s.Id);
                    }
                }
                finally
                {
                    semaphore.Release();
                }
            });

            await Task.WhenAll(tasks).ConfigureAwait(false);
        }
        finally
        {
            semaphore.Dispose();
        }

        var toRemove = staleIds.ToArray();
        if (toRemove.Length > 0)
        {
            await db.PushSubscriptions.Where(x => toRemove.Contains(x.Id)).ExecuteDeleteAsync(ct).ConfigureAwait(false);
            foreach (var id in toRemove)
                log.LogInformation("Removed stale push subscription {Id}", id);
        }
    }
}
