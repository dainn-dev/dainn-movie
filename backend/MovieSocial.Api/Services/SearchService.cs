using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;

namespace MovieSocial.Api.Services;

public class SearchService(AppDbContext db)
{
    public async Task<SearchResultDto> SearchAsync(string q, string? type, int page, int pageSize)
    {
        var term = q.Trim().ToLower();
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 50);
        var skip = (page - 1) * pageSize;

        var movies      = new List<MovieSummaryDto>();
        var celebrities = new List<CelebrityListDto>();
        var news        = new List<NewsListDto>();
        var total       = 0;

        if (type is null || type == "all")
        {
            var movieQ = db.Movies.AsNoTracking()
                .Where(m => m.Status == "published" &&
                    (m.Title.ToLower().Contains(term) ||
                     (m.Description != null && m.Description.ToLower().Contains(term))));
            var movieTotal = await movieQ.CountAsync();
            movies = await movieQ
                .OrderByDescending(m => m.ViewCount)
                .Skip(skip).Take(pageSize)
                .Select(m => new MovieSummaryDto(
                    m.Id, m.Title, m.Slug, m.PosterUrl, m.ReleaseYear,
                    m.Ratings.Any() ? Math.Round(m.Ratings.Average(r => (double)r.Score), 1) : 0,
                    m.ViewCount,
                    m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
                    null,
                    null))
                .ToListAsync();

            var celebQ = db.Celebrities.AsNoTracking()
                .Where(c => c.Name.ToLower().Contains(term));
            var celebTotal = await celebQ.CountAsync();
            celebrities = await celebQ
                .OrderByDescending(c => c.MovieCast.Count)
                .Skip(skip).Take(pageSize)
                .Select(c => new CelebrityListDto(
                    c.Id, c.Name, c.Slug, c.AvatarUrl, c.Country,
                    c.MovieCast.Count(mc => mc.Movie.Status == "published")))
                .ToListAsync();

            var newsQ = db.News.AsNoTracking()
                .Where(n => n.IsPublished && n.Title.ToLower().Contains(term));
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
                    (m.Title.ToLower().Contains(term) ||
                     (m.Description != null && m.Description.ToLower().Contains(term))));
            total = await movieQ.CountAsync();
            movies = await movieQ
                .OrderByDescending(m => m.ViewCount)
                .Skip(skip).Take(pageSize)
                .Select(m => new MovieSummaryDto(
                    m.Id, m.Title, m.Slug, m.PosterUrl, m.ReleaseYear,
                    m.Ratings.Any() ? Math.Round(m.Ratings.Average(r => (double)r.Score), 1) : 0,
                    m.ViewCount,
                    m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
                    null,
                    null))
                .ToListAsync();
        }
        else if (type == "celebrities")
        {
            var celebQ = db.Celebrities.AsNoTracking()
                .Where(c => c.Name.ToLower().Contains(term));
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
                .Where(n => n.IsPublished && n.Title.ToLower().Contains(term));
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
}
