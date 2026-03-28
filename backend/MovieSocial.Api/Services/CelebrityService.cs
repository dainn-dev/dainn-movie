using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;

namespace MovieSocial.Api.Services;

public class CelebrityService(AppDbContext db)
{
    public async Task<PagedResult<CelebrityListDto>> ListAsync(
        string? role, string? sort, int page, int pageSize, bool featured = false, string? search = null)
    {
        if (featured)
        {
            sort = "popular";
            page = 1;
        }

        var query = db.Celebrities.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var t = search.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(t));
        }

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(c => c.MovieCast.Any(mc => mc.Role == role));

        IOrderedQueryable<Models.Entities.Celebrity> ordered = sort switch
        {
            "title"  => query.OrderBy(c => c.Name),
            "newest" => query.OrderByDescending(c => c.CreatedAt),
            _        => query.OrderByDescending(c => c.MovieCast.Count),
        };

        var total = await ordered.CountAsync();
        var items = await ordered
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(c => new CelebrityListDto(
                c.Id, c.Name, c.Slug, c.AvatarUrl, c.Country,
                c.MovieCast.Count(mc => mc.Movie.Status == "published")))
            .ToListAsync();

        return new PagedResult<CelebrityListDto>(items,
            new PaginationMeta(page, pageSize, total, (int)Math.Ceiling((double)total / pageSize)));
    }

    public async Task<CelebrityDetailDto?> GetDetailAsync(string slug)
    {
        var c = await db.Celebrities.AsNoTracking()
            .Include(c => c.MovieCast).ThenInclude(mc => mc.Movie).ThenInclude(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(c => c.MovieCast).ThenInclude(mc => mc.Movie).ThenInclude(m => m.Ratings)
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (c is null) return null;

        var movies = c.MovieCast
            .Where(mc => mc.Movie.Status == "published")
            .OrderByDescending(mc => mc.Movie.CreatedAt)
            .Select(mc => new MovieSummaryDto(
                mc.Movie.Id, mc.Movie.Title, mc.Movie.Slug, mc.Movie.PosterUrl, mc.Movie.ReleaseYear,
                mc.Movie.Ratings.Any() ? Math.Round(mc.Movie.Ratings.Average(r => (double)r.Score), 1) : 0,
                mc.Movie.ViewCount,
                mc.Movie.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug))));

        return new CelebrityDetailDto(c.Id, c.Name, c.Slug, c.AvatarUrl, c.Bio, c.Country, c.DateOfBirth, movies);
    }
}
