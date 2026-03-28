using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class PayoutService(AppDbContext db, IConfiguration cfg)
{
    private int MinPayoutVnd => Math.Max(1, cfg.GetValue("Marketplace:MinPayoutVnd", 50_000));

    public async Task<CreatorPayoutBalanceDto> GetBalanceAsync(Guid creatorId)
    {
        var earnedNet = await db.Purchases.AsNoTracking()
            .Where(p => p.Movie.UploadedById == creatorId && p.Status == "completed")
            .SumAsync(p => (long?)(p.AmountVnd - p.PlatformFeeVnd)) ?? 0;

        var paidOut = await db.PayoutRequests.AsNoTracking()
            .Where(r => r.UserId == creatorId && r.Status == "paid")
            .SumAsync(r => (long?)r.AmountVnd) ?? 0;

        var pendingReserve = await db.PayoutRequests.AsNoTracking()
            .Where(r => r.UserId == creatorId && r.Status == "pending")
            .SumAsync(r => (long?)r.AmountVnd) ?? 0;

        var available = earnedNet - paidOut - pendingReserve;
        if (available < 0) available = 0;

        return new CreatorPayoutBalanceDto(earnedNet, paidOut, pendingReserve, available, MinPayoutVnd);
    }

    public async Task<(PayoutRequestItemDto? dto, string? error)> CreateRequestAsync(Guid creatorId, CreatePayoutRequestBody body)
    {
        if (body.AmountVnd < MinPayoutVnd)
            return (null, $"Số tiền tối thiểu mỗi lần rút là {MinPayoutVnd:N0}đ.");

        var balance = await GetBalanceAsync(creatorId);
        if (body.AmountVnd > balance.AvailableVnd)
            return (null, "Số tiền vượt quá số khả dụng (đã trừ các yêu cầu đang chờ và đã chi).");

        if (await db.PayoutRequests.AnyAsync(r => r.UserId == creatorId && r.Status == "pending"))
            return (null, "Bạn đã có một yêu cầu rút đang chờ xử lý.");

        var row = new PayoutRequest
        {
            UserId    = creatorId,
            AmountVnd = body.AmountVnd,
            Status    = "pending",
        };
        db.PayoutRequests.Add(row);
        await db.SaveChangesAsync();

        return (new PayoutRequestItemDto(row.Id, row.AmountVnd, row.Status, row.AdminNote, row.CreatedAt, row.ProcessedAt), null);
    }

    public async Task<List<PayoutRequestItemDto>> ListForCreatorAsync(Guid creatorId, int limit = 50)
    {
        limit = Math.Clamp(limit, 1, 100);
        return await db.PayoutRequests.AsNoTracking()
            .Where(r => r.UserId == creatorId)
            .OrderByDescending(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new PayoutRequestItemDto(
                r.Id, r.AmountVnd, r.Status, r.AdminNote, r.CreatedAt, r.ProcessedAt))
            .ToListAsync();
    }
}
