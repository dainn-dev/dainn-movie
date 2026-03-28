using System.Text;
using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;

namespace MovieSocial.Api.Services;

public class SearchService(AppDbContext db)
{
    public async Task<SearchResultDto> SearchAsync(string q, string? type, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 50);
        var skip = (page - 1) * pageSize;
        var pattern = ILikeContainsPattern(q);

        var movies      = new List<MovieSummaryDto>();
        var celebrities = new List<CelebrityListDto>();
        var news        = new List<NewsListDto>();
        var total       = 0;

        if (type is null || type == "all")
        {
            var movieQ = db.Movies.AsNoTracking()
                .Where(m => m.Status == "published" &&
                    (EF.Functions.ILike(m.Title, pattern) ||
                     (m.Description != null && EF.Functions.ILike(m.Description, pattern))));
            var movieTotal = await movieQ.CountAsync();
            movies = await movieQ
                .OrderByDescending(m => m.ViewCount)
                .Skip(skip).Take(pageSize)
                .Select(m => new MovieSummaryDto(
                    m.Id, m.Title, m.Slug, m.PosterUrl, m.ReleaseYear,
                    m.RatingCountCached > 0 ? Math.Round(m.AvgRatingCached, 1) : 0,
                    m.ViewCount,
                    m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
                    null,
                    null,
                    m.ListingPriceVnd))
                .ToListAsync();

            var celebQ = db.Celebrities.AsNoTracking()
                .Where(c => EF.Functions.ILike(c.Name, pattern));
            var celebTotal = await celebQ.CountAsync();
            celebrities = await celebQ
                .OrderByDescending(c => c.MovieCast.Count)
                .Skip(skip).Take(pageSize)
                .Select(c => new CelebrityListDto(
                    c.Id, c.Name, c.Slug, c.AvatarUrl, c.Country,
                    c.MovieCast.Count(mc => mc.Movie.Status == "published")))
                .ToListAsync();

            var newsQ = db.News.AsNoTracking()
                .Where(n => n.IsPublished && EF.Functions.ILike(n.Title, pattern));
            var newsTotal = await newsQ.CountAsync();
            news = await newsQ
                .OrderByDescending(n => n.CreatedAt)
                .Skip(skip).Take(pageSize)
                .Select(n => new NewsListDto(
                    n.Id, n.Title, n.Slug, n.CoverUrl,
                    n.Author.DisplayName, n.CreatedAt,
                    n.NewsTags.Select(nt => nt.Tag.Name)))
                .ToListAsync();

            total = movieTotal + celebTotal + newsTotal;
        }
        else if (type == "movies")
        {
            var movieQ = db.Movies.AsNoTracking()
                .Where(m => m.Status == "published" &&
                    (EF.Functions.ILike(m.Title, pattern) ||
                     (m.Description != null && EF.Functions.ILike(m.Description, pattern))));
            total = await movieQ.CountAsync();
            movies = await movieQ
                .OrderByDescending(m => m.ViewCount)
                .Skip(skip).Take(pageSize)
                .Select(m => new MovieSummaryDto(
                    m.Id, m.Title, m.Slug, m.PosterUrl, m.ReleaseYear,
                    m.RatingCountCached > 0 ? Math.Round(m.AvgRatingCached, 1) : 0,
                    m.ViewCount,
                    m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
                    null,
                    null,
                    m.ListingPriceVnd))
                .ToListAsync();
        }
        else if (type == "celebrities")
        {
            var celebQ = db.Celebrities.AsNoTracking()
                .Where(c => EF.Functions.ILike(c.Name, pattern));
            total = await celebQ.CountAsync();
            celebrities = await celebQ
                .OrderByDescending(c => c.MovieCast.Count)
                .Skip(skip).Take(pageSize)
                .Select(c => new CelebrityListDto(
                    c.Id, c.Name, c.Slug, c.AvatarUrl, c.Country,
                    c.MovieCast.Count(mc => mc.Movie.Status == "published")))
                .ToListAsync();
        }
        else if (type == "news")
        {
            var newsQ = db.News.AsNoTracking()
                .Where(n => n.IsPublished && EF.Functions.ILike(n.Title, pattern));
            total = await newsQ.CountAsync();
            news = await newsQ
                .OrderByDescending(n => n.CreatedAt)
                .Skip(skip).Take(pageSize)
                .Select(n => new NewsListDto(
                    n.Id, n.Title, n.Slug, n.CoverUrl,
                    n.Author.DisplayName, n.CreatedAt,
                    n.NewsTags.Select(nt => nt.Tag.Name)))
                .ToListAsync();
        }

        return new SearchResultDto(movies, celebrities, news, total);
    }

    /// <summary>ILIKE %term% với ký tự wildcard trong input được thay bằng khoảng trắng (tránh full scan kiểu LIKE đặc biệt).</summary>
    private static string ILikeContainsPattern(string raw)
    {
        var t = raw.Trim();
        if (t.Length == 0) return "%";
        var sb = new StringBuilder(t.Length + 2);
        sb.Append('%');
        foreach (var c in t)
        {
            if (c is '%' or '_' or '\\')
                sb.Append(' ');
            else
                sb.Append(c);
        }

        sb.Append('%');
        return sb.ToString();
    }
}
