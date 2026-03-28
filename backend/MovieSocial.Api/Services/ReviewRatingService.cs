using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class ReviewRatingService(AppDbContext db)
{
    public async Task<PagedResult<ReviewDto>> ListReviewsAsync(Guid movieId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 50);

        var q = db.Reviews.AsNoTracking()
            .Where(r => r.MovieId == movieId)
            .OrderByDescending(r => r.CreatedAt);

        var total = await q.CountAsync();
        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReviewDto(
                r.Id,
                r.UserId,
                r.User.Username,
                r.User.AvatarUrl,
                r.Title,
                r.Body,
                r.Score,
                r.CreatedAt))
            .ToListAsync();

        return new PagedResult<ReviewDto>(items,
            new PaginationMeta(page, pageSize, total, (int)Math.Ceiling((double)total / pageSize)));
    }

    /// <summary>One review per user per movie — creates or replaces.</summary>
    public async Task<(ReviewDto? dto, string? error, int status)> UpsertReviewAsync(
        Guid movieId, Guid userId, CreateReviewRequest req)
    {
        if (req.Score is < 1 or > 10)
            return (null, "Điểm phải từ 1 đến 10.", 400);

        var movieExists = await db.Movies.AnyAsync(m => m.Id == movieId && m.Status == "published");
        if (!movieExists) return (null, "Phim không tồn tại.", 404);

        var existing = await db.Reviews
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.UserId == userId && r.MovieId == movieId);

        if (existing is null)
        {
            var r = new Review
            {
                UserId  = userId,
                MovieId = movieId,
                Title   = req.Title,
                Body    = req.Body,
                Score   = req.Score,
            };
            db.Reviews.Add(r);
            await db.SaveChangesAsync();
            var dto = await ProjectReviewAsync(r.Id);
            return (dto, null, 201);
        }

        existing.Title     = req.Title;
        existing.Body      = req.Body;
        existing.Score     = req.Score;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return (await ProjectReviewAsync(existing.Id), null, 200);
    }

    public async Task<(ReviewDto? dto, string? error)> UpdateReviewAsync(
        Guid reviewId, Guid userId, UpdateReviewRequest req)
    {
        var r = await db.Reviews.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == reviewId);
        if (r is null) return (null, "Review không tồn tại.");
        if (r.UserId != userId) return (null, "Không có quyền sửa review này.");

        if (req.Title is not null) r.Title = req.Title;
        if (req.Body is not null) r.Body = req.Body;
        if (req.Score is not null)
        {
            if (req.Score is < 1 or > 10) return (null, "Điểm phải từ 1 đến 10.");
            r.Score = req.Score.Value;
        }

        r.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return (Map(r), null);
    }

    public async Task<string?> DeleteReviewAsync(Guid reviewId, Guid userId, string role)
    {
        var r = await db.Reviews.FindAsync(reviewId);
        if (r is null) return "Review không tồn tại.";
        if (r.UserId != userId && role != "admin") return "Không có quyền xoá.";
        db.Reviews.Remove(r);
        await db.SaveChangesAsync();
        return null;
    }

    public async Task<string?> RateMovieAsync(Guid movieId, Guid userId, int score)
    {
        if (score is < 1 or > 10) return "Điểm phải từ 1 đến 10.";

        var movieExists = await db.Movies.AnyAsync(m => m.Id == movieId && m.Status == "published");
        if (!movieExists) return "Phim không tồn tại.";

        var existing = await db.Ratings.FindAsync(userId, movieId);
        if (existing is null)
        {
            db.Ratings.Add(new Rating
            {
                UserId  = userId,
                MovieId = movieId,
                Score   = score,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }
        else
        {
            existing.Score     = score;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        return null;
    }

    public async Task<MovieRatingResponse?> GetRatingAsync(Guid movieId)
    {
        var m = await db.Movies.AsNoTracking()
            .Where(mv => mv.Id == movieId && mv.Status == "published")
            .Select(mv => new
            {
                Avg = mv.Ratings.Any() ? mv.Ratings.Average(x => (double)x.Score) : 0.0,
                Cnt = mv.Ratings.Count,
            })
            .FirstOrDefaultAsync();

        return m is null ? null : new MovieRatingResponse(Math.Round(m.Avg, 1), m.Cnt);
    }

    private async Task<ReviewDto?> ProjectReviewAsync(Guid id) =>
        await db.Reviews.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new ReviewDto(
                x.Id,
                x.UserId,
                x.User.Username,
                x.User.AvatarUrl,
                x.Title,
                x.Body,
                x.Score,
                x.CreatedAt))
            .FirstOrDefaultAsync();

    private static ReviewDto Map(Review r) => new(
        r.Id,
        r.UserId,
        r.User.Username,
        r.User.AvatarUrl,
        r.Title,
        r.Body,
        r.Score,
        r.CreatedAt);
}
