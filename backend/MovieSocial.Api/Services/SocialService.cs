using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class SocialService(AppDbContext db)
{
    private static (Guid Low, Guid High) OrderPair(Guid a, Guid b) =>
        a.CompareTo(b) < 0 ? (a, b) : (b, a);

    public async Task<List<UserSearchResultDto>> SearchUsersAsync(Guid currentUserId, string q, int limit = 20)
    {
        var t = q.Trim().ToLowerInvariant();
        if (t.Length < 2) return [];

        limit = Math.Clamp(limit, 1, 30);
        return await db.Users.AsNoTracking()
            .Where(u => u.Id != currentUserId && u.IsActive && u.Username.ToLower().Contains(t))
            .OrderBy(u => u.Username)
            .Take(limit)
            .Select(u => new UserSearchResultDto(u.Id, u.Username, u.DisplayName, u.AvatarUrl))
            .ToListAsync();
    }

    // ── Friends ────────────────────────────────────────────────────────────────
    public async Task<string?> SendFriendRequestAsync(Guid senderId, string receiverUsername)
    {
        var un = receiverUsername.Trim();
        var receiver = await db.Users.FirstOrDefaultAsync(u => u.Username == un && u.IsActive);
        if (receiver is null) return "Không tìm thấy người dùng.";
        if (receiver.Id == senderId) return "Không thể kết bạn với chính mình.";

        var (low, high) = OrderPair(senderId, receiver.Id);
        if (await db.Friendships.AnyAsync(f => f.UserId == low && f.FriendId == high))
            return "Hai bạn đã là bạn.";

        if (await db.FriendRequests.AnyAsync(fr =>
                fr.Status == "pending" &&
                ((fr.SenderId == senderId && fr.ReceiverId == receiver.Id) ||
                 (fr.SenderId == receiver.Id && fr.ReceiverId == senderId))))
            return "Đã có lời mời đang chờ.";

        var req = new FriendRequest { SenderId = senderId, ReceiverId = receiver.Id, Status = "pending" };
        db.FriendRequests.Add(req);
        db.Notifications.Add(new Notification
        {
            UserId     = receiver.Id,
            Type       = "friend_request",
            Title      = "Lời mời kết bạn",
            Body       = $"Bạn có lời mời kết bạn mới.",
            ReferenceId = req.Id,
        });
        await db.SaveChangesAsync();
        return null;
    }

    public async Task<List<FriendRequestDto>> ListIncomingRequestsAsync(Guid userId) =>
        await db.FriendRequests.AsNoTracking()
            .Where(fr => fr.ReceiverId == userId && fr.Status == "pending")
            .OrderByDescending(fr => fr.CreatedAt)
            .Select(fr => new FriendRequestDto(
                fr.Id,
                fr.SenderId,
                fr.Sender.Username,
                fr.Sender.DisplayName,
                fr.Sender.AvatarUrl,
                fr.ReceiverId,
                fr.Receiver.Username,
                fr.Status,
                fr.CreatedAt))
            .ToListAsync();

    public async Task<List<FriendRequestDto>> ListOutgoingRequestsAsync(Guid userId) =>
        await db.FriendRequests.AsNoTracking()
            .Where(fr => fr.SenderId == userId && fr.Status == "pending")
            .OrderByDescending(fr => fr.CreatedAt)
            .Select(fr => new FriendRequestDto(
                fr.Id,
                fr.SenderId,
                fr.Sender.Username,
                fr.Sender.DisplayName,
                fr.Sender.AvatarUrl,
                fr.ReceiverId,
                fr.Receiver.Username,
                fr.Status,
                fr.CreatedAt))
            .ToListAsync();

    public async Task<string?> AcceptFriendRequestAsync(Guid requestId, Guid receiverId)
    {
        var req = await db.FriendRequests
            .FirstOrDefaultAsync(fr => fr.Id == requestId && fr.ReceiverId == receiverId && fr.Status == "pending");
        if (req is null) return "Lời mời không hợp lệ.";

        var (low, high) = OrderPair(req.SenderId, req.ReceiverId);
        if (!await db.Friendships.AnyAsync(f => f.UserId == low && f.FriendId == high))
            db.Friendships.Add(new Friendship { UserId = low, FriendId = high });

        req.Status = "accepted";
        req.UpdatedAt = DateTime.UtcNow;

        db.Notifications.Add(new Notification
        {
            UserId = req.SenderId,
            Type = "friend_accepted",
            Title = "Kết bạn",
            Body = "Lời mời kết bạn của bạn đã được chấp nhận.",
        });

        await db.SaveChangesAsync();
        return null;
    }

    public async Task<string?> RejectFriendRequestAsync(Guid requestId, Guid receiverId)
    {
        var req = await db.FriendRequests
            .FirstOrDefaultAsync(fr => fr.Id == requestId && fr.ReceiverId == receiverId && fr.Status == "pending");
        if (req is null) return "Lời mời không hợp lệ.";
        req.Status = "rejected";
        req.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return null;
    }

    public async Task<List<FriendUserDto>> ListFriendsAsync(Guid userId)
    {
        var pairs = await db.Friendships.AsNoTracking()
            .Where(f => f.UserId == userId || f.FriendId == userId)
            .Select(f => new { f.UserId, f.FriendId })
            .ToListAsync();

        var friendIds = pairs
            .Select(p => p.UserId == userId ? p.FriendId : p.UserId)
            .Distinct()
            .ToList();

        return await db.Users.AsNoTracking()
            .Where(u => friendIds.Contains(u.Id))
            .OrderBy(u => u.DisplayName)
            .Select(u => new FriendUserDto(u.Id, u.Username, u.DisplayName, u.AvatarUrl))
            .ToListAsync();
    }

    public async Task<string?> RemoveFriendAsync(Guid userId, Guid friendId)
    {
        var (low, high) = OrderPair(userId, friendId);
        var f = await db.Friendships.FirstOrDefaultAsync(x => x.UserId == low && x.FriendId == high);
        if (f is null) return "Không có mối quan hệ bạn bè.";
        db.Friendships.Remove(f);
        await db.SaveChangesAsync();
        return null;
    }

    // ── Messages ────────────────────────────────────────────────────────────────
    public async Task<(MessageDto? dto, string? err)> SendMessageAsync(Guid senderId, SendMessageRequest req)
    {
        var body = req.Body.Trim();
        if (body.Length == 0 || body.Length > 8000)
            return (null, "Nội dung tin nhắn không hợp lệ.");

        if (req.ReceiverId == senderId)
            return (null, "Không thể gửi tin cho chính mình.");

        if (!await db.Users.AnyAsync(u => u.Id == req.ReceiverId && u.IsActive))
            return (null, "Người nhận không tồn tại.");

        var (low, high) = OrderPair(senderId, req.ReceiverId);
        if (!await db.Friendships.AnyAsync(f => f.UserId == low && f.FriendId == high))
            return (null, "Chỉ có thể nhắn tin khi đã kết bạn.");

        var msg = new Message
        {
            SenderId   = senderId,
            ReceiverId = req.ReceiverId,
            Body       = body,
        };
        db.Messages.Add(msg);

        db.Notifications.Add(new Notification
        {
            UserId = req.ReceiverId,
            Type = "message",
            Title = "Tin nhắn mới",
            Body = body.Length > 120 ? body[..117] + "…" : body,
            ReferenceId = msg.Id,
        });

        await db.SaveChangesAsync();

        return (new MessageDto(msg.Id, msg.SenderId, msg.ReceiverId, msg.Body, msg.CreatedAt, msg.IsRead), null);
    }

    public async Task<PagedResult<MessageDto>> ListConversationAsync(Guid userId, Guid otherUserId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 30 : Math.Min(pageSize, 100);

        var q = db.Messages.AsNoTracking()
            .Where(m =>
                (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                (m.SenderId == otherUserId && m.ReceiverId == userId));

        var total = await q.CountAsync();
        var batch = await q
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MessageDto(m.Id, m.SenderId, m.ReceiverId, m.Body, m.CreatedAt, m.IsRead))
            .ToListAsync();

        var items = batch.OrderBy(m => m.CreatedAt).ToList();

        return new PagedResult<MessageDto>(items, new PaginationMeta(page, pageSize, total, (int)Math.Ceiling((double)total / pageSize)));
    }

    public async Task MarkConversationReadAsync(Guid userId, Guid otherUserId)
    {
        var unread = await db.Messages
            .Where(m => m.SenderId == otherUserId && m.ReceiverId == userId && !m.IsRead)
            .ToListAsync();
        foreach (var m in unread)
        {
            m.IsRead = true;
            m.ReadAt = DateTime.UtcNow;
            m.UpdatedAt = DateTime.UtcNow;
        }
        if (unread.Count > 0)
            await db.SaveChangesAsync();
    }

    // ── Notifications ──────────────────────────────────────────────────────────
    public async Task<List<NotificationDto>> ListNotificationsAsync(Guid userId, int limit = 50)
    {
        limit = Math.Clamp(limit, 1, 100);
        return await db.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .Select(n => new NotificationDto(n.Id, n.Type, n.Title, n.Body, n.IsRead, n.CreatedAt, n.ReferenceId, n.ReferenceMovieId))
            .ToListAsync();
    }

    public async Task<int> UnreadNotificationCountAsync(Guid userId) =>
        await db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

    public async Task<string?> MarkNotificationReadAsync(Guid userId, Guid notificationId)
    {
        var n = await db.Notifications.FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId);
        if (n is null) return "Không tìm thấy.";
        n.IsRead = true;
        n.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return null;
    }

    public async Task MarkAllNotificationsReadAsync(Guid userId)
    {
        await db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true).SetProperty(n => n.UpdatedAt, DateTime.UtcNow));
    }

    // ── Watchlist ────────────────────────────────────────────────────────────────
    public async Task<string?> AddWatchlistAsync(Guid userId, Guid movieId)
    {
        if (!await db.Movies.AnyAsync(m => m.Id == movieId && m.Status == "published"))
            return "Phim không tồn tại.";
        if (await db.Watchlist.AnyAsync(w => w.UserId == userId && w.MovieId == movieId))
            return null;
        db.Watchlist.Add(new Watchlist { UserId = userId, MovieId = movieId });
        await db.SaveChangesAsync();
        return null;
    }

    public async Task RemoveWatchlistAsync(Guid userId, Guid movieId)
    {
        var w = await db.Watchlist.FindAsync(userId, movieId);
        if (w is not null)
        {
            db.Watchlist.Remove(w);
            await db.SaveChangesAsync();
        }
    }

    public async Task<List<MovieSummaryDto>> ListWatchlistAsync(Guid userId) =>
        await db.Watchlist.AsNoTracking()
            .Where(w => w.UserId == userId && w.Movie.Status == "published")
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new MovieSummaryDto(
                w.Movie.Id,
                w.Movie.Title,
                w.Movie.Slug,
                w.Movie.PosterUrl,
                w.Movie.ReleaseYear,
                w.Movie.RatingCountCached > 0 ? Math.Round(w.Movie.AvgRatingCached, 1) : 0,
                w.Movie.ViewCount,
                w.Movie.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
                null,
                null,
                w.Movie.ListingPriceVnd))
            .ToListAsync();

    public Task<bool> WatchlistContainsAsync(Guid userId, Guid movieId) =>
        db.Watchlist.AsNoTracking().AnyAsync(w => w.UserId == userId && w.MovieId == movieId);

    // ── Movie follow (M9: notify new episodes for free titles) ─────────────────
    public async Task<string?> FollowMovieAsync(Guid userId, Guid movieId)
    {
        if (!await db.Movies.AnyAsync(m => m.Id == movieId && m.Status == "published"))
            return "Phim không tồn tại.";
        if (await db.MovieFollows.AnyAsync(f => f.UserId == userId && f.MovieId == movieId))
            return null;
        db.MovieFollows.Add(new MovieFollow { UserId = userId, MovieId = movieId });
        await db.SaveChangesAsync();
        return null;
    }

    public async Task UnfollowMovieAsync(Guid userId, Guid movieId)
    {
        var f = await db.MovieFollows.FindAsync(userId, movieId);
        if (f is not null)
        {
            db.MovieFollows.Remove(f);
            await db.SaveChangesAsync();
        }
    }

    public Task<bool> MovieFollowContainsAsync(Guid userId, Guid movieId) =>
        db.MovieFollows.AsNoTracking().AnyAsync(f => f.UserId == userId && f.MovieId == movieId);

    // ── Watch history ──────────────────────────────────────────────────────────
    public async Task RecordWatchHistoryAsync(Guid userId, RecordWatchHistoryRequest req)
    {
        var prog = Math.Max(0, req.ProgressSeconds);
        if (!await db.Chapters.AnyAsync(c => c.Id == req.ChapterId && c.MovieId == req.MovieId))
            return;

        var existing = await db.WatchHistory
            .Where(h => h.UserId == userId && h.MovieId == req.MovieId && h.ChapterId == req.ChapterId)
            .OrderByDescending(h => h.WatchedAt)
            .FirstOrDefaultAsync();

        if (existing is not null && (DateTime.UtcNow - existing.WatchedAt).TotalSeconds < 10)
        {
            existing.ProgressSeconds = prog;
            existing.WatchedAt = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            db.WatchHistory.Add(new WatchHistory
            {
                UserId           = userId,
                MovieId          = req.MovieId,
                ChapterId        = req.ChapterId,
                ProgressSeconds  = prog,
                WatchedAt        = DateTime.UtcNow,
            });
        }
        await db.SaveChangesAsync();
    }

    public async Task<List<WatchHistoryItemDto>> ListWatchHistoryAsync(Guid userId, int limit = 30)
    {
        limit = Math.Clamp(limit, 1, 100);
        return await db.WatchHistory.AsNoTracking()
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.WatchedAt)
            .Take(limit)
            .Select(h => new WatchHistoryItemDto(
                h.Id,
                h.Movie.Id,
                h.Movie.Title,
                h.Movie.PosterUrl,
                h.Chapter.Id,
                h.Chapter.Title,
                h.ProgressSeconds,
                h.WatchedAt))
            .ToListAsync();
    }

    public async Task<int> GetWatchProgressSecondsAsync(Guid userId, Guid movieId, Guid chapterId)
    {
        var p = await db.WatchHistory.AsNoTracking()
            .Where(h => h.UserId == userId && h.MovieId == movieId && h.ChapterId == chapterId)
            .OrderByDescending(h => h.WatchedAt)
            .Select(h => (int?)h.ProgressSeconds)
            .FirstOrDefaultAsync();
        return p ?? 0;
    }

    // ── Reports ────────────────────────────────────────────────────────────────
    public async Task<string?> SubmitReportAsync(Guid reporterId, SubmitReportRequest req)
    {
        var tt = req.TargetType.Trim().ToLowerInvariant();
        if (tt is not ("movie" or "review" or "user" or "message"))
            return "Loại báo cáo không hợp lệ.";

        var reason = req.Reason.Trim();
        if (reason.Length < 3 || reason.Length > 2000)
            return "Lý do báo cáo không hợp lệ.";

        db.ContentReports.Add(new ContentReport
        {
            ReporterId = reporterId,
            TargetType = tt,
            TargetId = req.TargetId,
            Reason = reason,
            Status = "pending",
        });
        await db.SaveChangesAsync();
        return null;
    }
}
