using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class AdminService(AppDbContext db)
{
    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var users = await db.Users.CountAsync();
        var activeUsers = await db.Users.CountAsync(u => u.IsActive);
        var movies = await db.Movies.CountAsync();
        var published = await db.Movies.CountAsync(m => m.Status == "published");
        var pendingMovies = await db.Movies.CountAsync(m => m.Status == "draft" || m.Status == "processing");
        var news = await db.News.CountAsync();
        var celebs = await db.Celebrities.CountAsync();
        var reports = await db.ContentReports.CountAsync(r => r.Status == "pending");

        return new AdminStatsDto(users, activeUsers, movies, published, pendingMovies, news, celebs, reports);
    }

    public async Task<PagedResult<AdminUserSummaryDto>> ListUsersAsync(int page, int pageSize, string? search)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var q = db.Users.AsNoTracking().OrderByDescending(u => u.CreatedAt);
        var filtered = string.IsNullOrWhiteSpace(search)
            ? q
            : q.Where(u =>
                u.Username.ToLower().Contains(search.Trim().ToLower()) ||
                u.Email.ToLower().Contains(search.Trim().ToLower()) ||
                u.DisplayName.ToLower().Contains(search.Trim().ToLower()));

        var total = await filtered.CountAsync();
        var items = await filtered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserSummaryDto(
                u.Id, u.Username, u.Email, u.DisplayName, u.Role, u.IsActive, u.IsVerified, u.CreatedAt))
            .ToListAsync();

        return new PagedResult<AdminUserSummaryDto>(items, new PaginationMeta(page, pageSize, total, (int)Math.Ceiling((double)total / pageSize)));
    }

    public async Task<(AdminUserSummaryDto? dto, string? err)> UpdateUserAsync(Guid id, AdminUpdateUserRequest req)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return (null, "Không tìm thấy user.");

        if (req.IsActive is not null) user.IsActive = req.IsActive.Value;

        if (req.Role is not null)
        {
            var r = req.Role.Trim().ToLowerInvariant();
            if (r is not ("user" or "admin")) return (null, "Role không hợp lệ.");
            if (user.Role == "admin" && r == "user")
            {
                var adminCount = await db.Users.CountAsync(u => u.Role == "admin" && u.IsActive);
                if (adminCount <= 1) return (null, "Không thể gỡ quyền admin cuối cùng.");
            }
            user.Role = r;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return (new AdminUserSummaryDto(
            user.Id, user.Username, user.Email, user.DisplayName, user.Role, user.IsActive, user.IsVerified, user.CreatedAt), null);
    }

    public async Task<PagedResult<MovieSummaryDto>> ListPendingMoviesAsync(int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var q = db.Movies.AsNoTracking()
            .Where(m => m.Status == "draft" || m.Status == "processing")
            .OrderByDescending(m => m.UpdatedAt);

        var total = await q.CountAsync();
        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MovieSummaryDto(
                m.Id,
                m.Title,
                m.Slug,
                m.PosterUrl,
                m.ReleaseYear,
                m.Ratings.Any() ? Math.Round(m.Ratings.Average(r => (double)r.Score), 1) : 0,
                m.ViewCount,
                m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
                m.Status,
                m.CreatedAt))
            .ToListAsync();

        return new PagedResult<MovieSummaryDto>(items, new PaginationMeta(page, pageSize, total, (int)Math.Ceiling((double)total / pageSize)));
    }

    public async Task<string?> ModerateMovieAsync(Guid movieId, ModerateMovieRequest req)
    {
        var movie = await db.Movies.FindAsync(movieId);
        if (movie is null) return "Phim không tồn tại.";
        movie.Status = req.Approve ? "published" : "rejected";
        movie.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return null;
    }

    public async Task<PagedResult<ContentReportAdminDto>> ListPendingReportsAsync(int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var q = db.ContentReports.AsNoTracking()
            .Where(r => r.Status == "pending")
            .OrderByDescending(r => r.CreatedAt);

        var total = await q.CountAsync();
        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ContentReportAdminDto(
                r.Id,
                r.ReporterId,
                r.Reporter.Username,
                r.TargetType,
                r.TargetId,
                r.Reason,
                r.Status,
                r.CreatedAt))
            .ToListAsync();

        return new PagedResult<ContentReportAdminDto>(items, new PaginationMeta(page, pageSize, total, (int)Math.Ceiling((double)total / pageSize)));
    }

    public async Task<string?> ResolveReportAsync(Guid reportId, AdminResolveReportRequest req)
    {
        var status = req.Status.Trim().ToLowerInvariant();
        if (status is not ("dismissed" or "actioned")) return "Trạng thái không hợp lệ.";

        var r = await db.ContentReports.FindAsync(reportId);
        if (r is null) return "Báo cáo không tồn tại.";
        r.Status = status;
        r.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return null;
    }
}
