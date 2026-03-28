using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class PurchaseService(AppDbContext db, IConfiguration cfg, IDistributedCache cache, ILogger<PurchaseService> log)
{
    private int PlatformFeeBps => Math.Clamp(cfg.GetValue("Marketplace:PlatformFeeBps", 1000), 0, 10_000);

    private bool MockCheckoutEnabled => cfg.GetValue("Marketplace:MockCheckoutEnabled", false);

    private string? WebhookSharedSecret => cfg["Marketplace:WebhookSharedSecret"];

    public async Task<(CheckoutResponseDto? dto, string? error, int status)> CheckoutAsync(
        Guid buyerId, string buyerRole, CheckoutRequest req)
    {
        var movie = await db.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.Id == req.MovieId);
        if (movie is null || movie.Status != "published")
            return (null, "Phim không tồn tại hoặc chưa công khai.", 404);

        if (!EntitlementService.IsPaidListing(movie))
            return (null, "Phim này xem miễn phí — không cần mua.", 400);

        if (movie.UploadedById == buyerId)
            return (null, "Bạn là chủ phim — không cần mua.", 400);

        if (string.Equals(buyerRole, "admin", StringComparison.OrdinalIgnoreCase))
            return (null, "Admin không cần mua.", 400);

        var hasCompleted = await db.Purchases.AsNoTracking()
            .AnyAsync(p => p.UserId == buyerId && p.MovieId == movie.Id && p.Status == "completed");
        if (hasCompleted)
            return (null, "Bạn đã sở hữu phim này.", 400);

        var amount = movie.ListingPriceVnd!.Value;
        var fee = (int)Math.Round(amount * (PlatformFeeBps / 10_000.0), MidpointRounding.AwayFromZero);
        fee = Math.Min(fee, amount);
        var net = amount - fee;

        var purchase = new Purchase
        {
            UserId          = buyerId,
            MovieId         = movie.Id,
            AmountVnd       = amount,
            PlatformFeeVnd  = fee,
            Status          = "pending",
            Provider        = "mock",
        };
        db.Purchases.Add(purchase);
        await db.SaveChangesAsync();

        log.LogInformation("Purchase {PurchaseId} pending for movie {MovieId} amount {Amount} VND", purchase.Id, movie.Id, amount);

        return (new CheckoutResponseDto(
            purchase.Id,
            purchase.Status,
            amount,
            fee,
            net,
            MockCheckoutEnabled,
            MockCheckoutEnabled
                ? "Gọi POST /api/purchases/{id}/mock-complete để hoàn tất (chỉ môi trường dev / cấu hình mock)."
                : "Đơn đang chờ thanh toán. Sau khi cổng VN xác nhận, webhook sẽ cập nhật trạng thái (hoặc dùng mock trong dev)."
        ), null, 200);
    }

    public async Task<(bool ok, string? error)> MockCompleteAsync(Guid purchaseId, Guid buyerId)
    {
        if (!MockCheckoutEnabled)
            return (false, "Mock checkout không bật (Marketplace:MockCheckoutEnabled).");

        var p = await db.Purchases.FirstOrDefaultAsync(x => x.Id == purchaseId);
        if (p is null) return (false, "Đơn không tồn tại.");
        if (p.UserId != buyerId) return (false, "Không phải đơn của bạn.");
        if (p.Status != "pending") return (false, "Đơn không ở trạng thái chờ thanh toán.");

        p.Status       = "completed";
        p.CompletedAt  = DateTime.UtcNow;
        p.ExternalId   = "mock-" + Guid.NewGuid().ToString("N")[..12];
        p.UpdatedAt    = DateTime.UtcNow;
        await db.SaveChangesAsync();

        log.LogInformation("Purchase {PurchaseId} completed (mock)", purchaseId);
        return (true, null);
    }

    public async Task<List<PurchaseListItemDto>> ListForUserAsync(Guid userId, int limit = 50)
    {
        limit = Math.Clamp(limit, 1, 100);
        return await db.Purchases.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Take(limit)
            .Select(x => new PurchaseListItemDto(
                x.Id,
                x.MovieId,
                x.Movie.Title,
                x.Movie.PosterUrl,
                x.AmountVnd,
                x.Status,
                x.CreatedAt,
                x.CompletedAt))
            .ToListAsync();
    }

    /// <summary>Chi tiết đơn: người mua hoặc creator của phim.</summary>
    public async Task<(PurchaseDetailDto? dto, string? error, int status)> GetDetailForPartyAsync(
        Guid purchaseId, Guid userId, string userRole)
    {
        var row = await db.Purchases.AsNoTracking()
            .Where(p => p.Id == purchaseId)
            .Select(p => new
            {
                p.Id,
                p.MovieId,
                MovieTitle = p.Movie.Title,
                Poster = p.Movie.PosterUrl,
                UploaderId = p.Movie.UploadedById,
                p.AmountVnd,
                p.PlatformFeeVnd,
                p.Status,
                p.Provider,
                p.ExternalId,
                p.UserId,
                p.CreatedAt,
                p.CompletedAt,
            })
            .FirstOrDefaultAsync();

        if (row is null) return (null, "Đơn không tồn tại.", 404);

        var isBuyer = row.UserId == userId;
        var isSeller = row.UploaderId == userId;
        var isAdmin = string.Equals(userRole, "admin", StringComparison.OrdinalIgnoreCase);
        if (!isBuyer && !isSeller && !isAdmin) return (null, "Không có quyền xem đơn này.", 403);

        var net = row.AmountVnd - row.PlatformFeeVnd;
        var viewer = isAdmin ? "admin" : (isBuyer ? "buyer" : "seller");
        return (new PurchaseDetailDto(
            row.Id,
            row.MovieId,
            row.MovieTitle,
            row.Poster,
            row.AmountVnd,
            row.PlatformFeeVnd,
            net,
            row.Status,
            row.Provider,
            row.ExternalId,
            row.CreatedAt,
            row.CompletedAt,
            viewer), null, 200);
    }

    public async Task<(CreatorSalesResponseDto? dto, string? error)> ListCreatorSalesAsync(Guid creatorId, int limit = 50)
    {
        limit = Math.Clamp(limit, 1, 100);

        var q = db.Purchases.AsNoTracking()
            .Where(p => p.Movie.UploadedById == creatorId)
            .OrderByDescending(p => p.CreatedAt);

        var items = await q.Take(limit)
            .Select(p => new CreatorSaleRowDto(
                p.Id,
                p.MovieId,
                p.Movie.Title,
                p.User.Username,
                p.AmountVnd,
                p.PlatformFeeVnd,
                p.AmountVnd - p.PlatformFeeVnd,
                p.Status,
                p.CreatedAt,
                p.CompletedAt))
            .ToListAsync();

        var baseQ = db.Purchases.AsNoTracking().Where(p => p.Movie.UploadedById == creatorId);

        var completedCount = await baseQ.CountAsync(p => p.Status == "completed");
        var pending        = await baseQ.CountAsync(p => p.Status == "pending");
        var totalGross     = await baseQ.Where(p => p.Status == "completed").SumAsync(p => (long?)p.AmountVnd) ?? 0;
        var totalFees      = await baseQ.Where(p => p.Status == "completed").SumAsync(p => (long?)p.PlatformFeeVnd) ?? 0;
        var totalNet       = totalGross - totalFees;

        var summary = new CreatorSalesSummaryDto(
            completedCount,
            pending,
            totalGross,
            totalFees,
            totalNet);

        return (new CreatorSalesResponseDto(summary, items), null);
    }

    /// <summary>Webhook cổng thanh toán — bảo vệ bằng X-Webhook-Secret + Idempotency-Key (Redis).</summary>
    public async Task<(bool ok, bool duplicate, string? error, int status)> ProcessWebhookPaymentAsync(
        string? providedSecret,
        string? idempotencyKey,
        WebhookPaymentNotifyDto body)
    {
        var expected = WebhookSharedSecret;
        if (string.IsNullOrWhiteSpace(expected))
            return (false, false, "Webhook chưa cấu hình (Marketplace:WebhookSharedSecret).", 503);

        if (string.IsNullOrWhiteSpace(providedSecret) || !string.Equals(providedSecret, expected, StringComparison.Ordinal))
            return (false, false, "Không hợp lệ.", 401);

        if (string.IsNullOrWhiteSpace(idempotencyKey))
            return (false, false, "Thiếu header Idempotency-Key.", 400);

        var idemCacheKey = $"moviesocial:webhook:idem:{idempotencyKey.Trim()}";
        try
        {
            var seen = await cache.GetStringAsync(idemCacheKey).ConfigureAwait(false);
            if (seen == "1")
                return (true, true, null, 200);
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Webhook idempotency read failed");
        }

        var p = await db.Purchases.FirstOrDefaultAsync(x => x.Id == body.PurchaseId);
        if (p is null) return (false, false, "Đơn không tồn tại.", 404);
        if (p.Status != "pending")
        {
            try
            {
                await cache.SetStringAsync(
                    idemCacheKey,
                    "1",
                    new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(30) });
            }
            catch { /* ignore */ }
            return (true, true, null, 200);
        }

        if (body.Paid)
        {
            p.Status      = "completed";
            p.CompletedAt = DateTime.UtcNow;
            p.ExternalId  = string.IsNullOrWhiteSpace(body.ExternalTransactionId)
                ? "webhook-" + Guid.NewGuid().ToString("N")[..12]
                : body.ExternalTransactionId!.Trim();
            p.Provider    = "webhook";
            p.UpdatedAt   = DateTime.UtcNow;
        }
        else
        {
            p.Status    = "failed";
            p.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();

        try
        {
            await cache.SetStringAsync(
                idemCacheKey,
                "1",
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(30) });
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Webhook idempotency write failed");
        }

        log.LogInformation("Purchase {PurchaseId} webhook → {Status}", body.PurchaseId, p.Status);
        return (true, false, null, 200);
    }
}
