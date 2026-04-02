using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class MovieService(AppDbContext db, EntitlementService entitlements, CatalogReadCache catalogCache)
{
    // ── List ──────────────────────────────────────────────────────────────────
    public async Task<PagedResult<MovieSummaryDto>> ListAsync(
        string? genre, int? year, string? sort, int page, int pageSize)
    {
        var q = db.Movies
            .AsNoTracking()
            .Where(m => m.Status == "published");

        if (!string.IsNullOrWhiteSpace(genre))
            q = q.Where(m => m.MovieGenres.Any(mg => mg.Genre.Slug == genre));

        if (year.HasValue)
            q = q.Where(m => m.ReleaseYear == year.Value);

        q = sort switch
        {
            "popular" => q.OrderByDescending(m => m.ViewCount),
            "rating"  => q.OrderByDescending(m => m.AvgRatingCached),
            "reviews" => q.OrderByDescending(m => m.ReviewCountCached),
            "title"   => q.OrderBy(m => m.Title),
            _         => q.OrderByDescending(m => m.CreatedAt),
        };

        var total = await q.CountAsync();
        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MovieSummaryDto(
                m.Id, m.Title, m.Slug, m.PosterUrl, m.ReleaseYear,
                m.RatingCountCached > 0 ? Math.Round(m.AvgRatingCached, 1) : 0,
                m.ViewCount,
                m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
                null,
                null,
                m.ListingPriceVnd))
            .ToListAsync();

        return new PagedResult<MovieSummaryDto>(items, new PaginationMeta(page, pageSize, total, (int)Math.Ceiling((double)total / pageSize)));
    }

    public async Task<PagedResult<MovieSummaryDto>> ListMyUploadedAsync(Guid userId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : pageSize;

        var q = db.Movies
            .AsNoTracking()
            .Where(m => m.UploadedById == userId)
            .OrderByDescending(m => m.CreatedAt);

        var total = await q.CountAsync();
        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MovieSummaryDto(
                m.Id, m.Title, m.Slug, m.PosterUrl, m.ReleaseYear,
                m.RatingCountCached > 0 ? Math.Round(m.AvgRatingCached, 1) : 0,
                m.ViewCount,
                m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
                m.Status,
                m.CreatedAt,
                m.ListingPriceVnd))
            .ToListAsync();

        return new PagedResult<MovieSummaryDto>(items, new PaginationMeta(page, pageSize, total, (int)Math.Ceiling((double)total / pageSize)));
    }

    // ── Detail ────────────────────────────────────────────────────────────────
    public Task<MovieDetailDto?> GetDetailAsync(Guid id) => GetDetailAsync(id, null, null);

    public async Task<MovieDetailDto?> GetDetailAsync(Guid id, Guid? viewerId, string? viewerRole)
    {
        var m = await db.Movies
            .AsNoTracking()
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.Cast).ThenInclude(mc => mc.Celebrity)
            .Include(m => m.Chapters).ThenInclude(c => c.VideoSources)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (m is null) return null;

        var isAdmin = string.Equals(viewerRole, "admin", StringComparison.Ordinal);
        var isOwner = viewerId.HasValue && m.UploadedById == viewerId;
        if (m.Status != "published" && !isAdmin && !isOwner)
            return null;

        var related = m.Status == "published"
            ? await GetRelatedSummariesAsync(m.Id, 8)
            : [];
        var endpointCounts = await LoadStreamEndpointCountsAsync(m);
        return await BuildDetailDtoAsync(m, related, viewerId, viewerRole, endpointCounts);
    }

    public async Task<MovieDetailDto?> GetDetailBySlugAsync(string slug, Guid? viewerId, string? viewerRole)
    {
        var m = await db.Movies
            .AsNoTracking()
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.Cast).ThenInclude(mc => mc.Celebrity)
            .Include(m => m.Chapters).ThenInclude(c => c.VideoSources)
            .FirstOrDefaultAsync(m => m.Slug == slug && m.Status == "published");

        if (m is null) return null;
        var related = await GetRelatedSummariesAsync(m.Id, 8);
        var endpointCounts = await LoadStreamEndpointCountsAsync(m);
        return await BuildDetailDtoAsync(m, related, viewerId, viewerRole, endpointCounts);
    }

    public async Task<List<MovieSummaryDto>> GetRelatedSummariesAsync(Guid movieId, int limit = 8)
    {
        var genreIds = await db.MovieGenres.AsNoTracking()
            .Where(mg => mg.MovieId == movieId)
            .Select(mg => mg.GenreId)
            .ToListAsync();

        var q = db.Movies.AsNoTracking()
            .Where(m => m.Id != movieId && m.Status == "published");

        if (genreIds.Count > 0)
            q = q.Where(m => m.MovieGenres.Any(mg => genreIds.Contains(mg.GenreId)));
        else
            q = q.OrderByDescending(m => m.ViewCount);

        return await q
            .OrderByDescending(m => m.ViewCount)
            .Take(limit)
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

    public async Task<string?> AddFavoriteAsync(Guid movieId, Guid userId)
    {
        var ok = await db.Movies.AnyAsync(m => m.Id == movieId && m.Status == "published");
        if (!ok) return "Phim không tồn tại.";
        if (await db.Favorites.AnyAsync(f => f.UserId == userId && f.MovieId == movieId))
            return null;
        db.Favorites.Add(new Favorite { UserId = userId, MovieId = movieId });
        await db.SaveChangesAsync();
        return null;
    }

    public async Task<string?> RemoveFavoriteAsync(Guid movieId, Guid userId)
    {
        var f = await db.Favorites.FindAsync(userId, movieId);
        if (f is null) return null;
        db.Favorites.Remove(f);
        await db.SaveChangesAsync();
        return null;
    }

    public Task<bool> IsFavoriteAsync(Guid movieId, Guid userId) =>
        db.Favorites.AsNoTracking().AnyAsync(f => f.UserId == userId && f.MovieId == movieId);

    // ── Featured / Popular / Latest (Redis catalog cache, TTL trong CatalogCache) ──
    public async Task<List<MovieSummaryDto>> GetFeaturedAsync(int limit = 6)
    {
        var n = limit < 1 ? 6 : limit;
        var key = $"moviesocial:catalog:featured:v1:{n}";
        var cached = await catalogCache.GetAsync<List<MovieSummaryDto>>(key).ConfigureAwait(false);
        if (cached is not null) return cached;
        var list = await QuerySummaries(db.Movies.Where(m => m.Status == "published")
            .OrderByDescending(m => m.ViewCount), n).ConfigureAwait(false);
        await catalogCache.SetAsync(key, list).ConfigureAwait(false);
        return list;
    }

    public async Task<List<MovieSummaryDto>> GetPopularAsync(int limit = 20)
    {
        var n = limit < 1 ? 20 : limit;
        var key = $"moviesocial:catalog:popular:v1:{n}";
        var cached = await catalogCache.GetAsync<List<MovieSummaryDto>>(key).ConfigureAwait(false);
        if (cached is not null) return cached;
        var list = await QuerySummaries(db.Movies.Where(m => m.Status == "published")
            .OrderByDescending(m => m.ViewCount), n).ConfigureAwait(false);
        await catalogCache.SetAsync(key, list).ConfigureAwait(false);
        return list;
    }

    public async Task<List<MovieSummaryDto>> GetLatestAsync(int limit = 20)
    {
        var n = limit < 1 ? 20 : limit;
        var key = $"moviesocial:catalog:latest:v1:{n}";
        var cached = await catalogCache.GetAsync<List<MovieSummaryDto>>(key).ConfigureAwait(false);
        if (cached is not null) return cached;
        var list = await QuerySummaries(db.Movies.Where(m => m.Status == "published")
            .OrderByDescending(m => m.CreatedAt), n).ConfigureAwait(false);
        await catalogCache.SetAsync(key, list).ConfigureAwait(false);
        return list;
    }

    public async Task<List<MovieTrailerDto>> GetTrailersAsync(int limit = 6)
    {
        var n = limit < 1 ? 6 : limit;
        var key = $"moviesocial:catalog:trailers:v1:{n}";
        var cached = await catalogCache.GetAsync<List<MovieTrailerDto>>(key).ConfigureAwait(false);
        if (cached is not null) return cached;
        var list = await db.Movies.AsNoTracking()
            .Where(m => m.Status == "published"
                && m.TrailerUrl != null && m.TrailerUrl != "")
            .OrderByDescending(m => m.ViewCount)
            .Take(n)
            .Select(m => new MovieTrailerDto(
                m.Id, m.Title, m.Slug, m.PosterUrl, m.TrailerUrl!))
            .ToListAsync();
        await catalogCache.SetAsync(key, list).ConfigureAwait(false);
        return list;
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public async Task<MovieSummaryDto> CreateAsync(CreateMovieRequest req, Guid uploaderId)
    {
        var slug = GenerateSlug(req.Title);
        var movie = new Movie
        {
            Title          = req.Title,
            Slug           = slug,
            Description    = req.Description,
            PosterUrl      = req.PosterUrl,
            BackdropUrl    = req.BackdropUrl,
            TrailerUrl     = req.TrailerUrl,
            ReleaseYear    = req.ReleaseYear,
            RuntimeMinutes = req.RuntimeMinutes,
            MpaaRating     = req.MpaaRating,
            Status            = "draft",
            UploadedById      = uploaderId,
            ListingPriceVnd   = NormalizeListingPrice(req.ListingPriceVnd),
        };

        db.Movies.Add(movie);
        await db.SaveChangesAsync();

        if (req.GenreIds.Any())
        {
            db.MovieGenres.AddRange(req.GenreIds.Select(gid => new MovieGenre { MovieId = movie.Id, GenreId = gid }));
            await db.SaveChangesAsync();
        }

        return new MovieSummaryDto(
            movie.Id, movie.Title, movie.Slug, movie.PosterUrl, movie.ReleaseYear, 0, 0, [],
            null, null, movie.ListingPriceVnd);
    }

    // ── Update ────────────────────────────────────────────────────────────────
    public async Task<(MovieSummaryDto? result, string? error)> UpdateAsync(Guid id, UpdateMovieRequest req, Guid requesterId, string requesterRole)
    {
        var movie = await db.Movies.Include(m => m.MovieGenres).FirstOrDefaultAsync(m => m.Id == id);
        if (movie is null) return (null, "Phim không tồn tại.");
        if (requesterRole != "admin" && movie.UploadedById != requesterId) return (null, "Không có quyền sửa phim này.");

        if (req.Title        is not null) movie.Title          = req.Title;
        if (req.Description  is not null) movie.Description    = req.Description;
        if (req.PosterUrl    is not null) movie.PosterUrl      = req.PosterUrl;
        if (req.BackdropUrl  is not null) movie.BackdropUrl    = req.BackdropUrl;
        if (req.TrailerUrl   is not null) movie.TrailerUrl     = req.TrailerUrl;
        if (req.ReleaseYear  is not null) movie.ReleaseYear    = req.ReleaseYear;
        if (req.RuntimeMinutes is not null) movie.RuntimeMinutes = req.RuntimeMinutes;
        if (req.MpaaRating   is not null) movie.MpaaRating     = req.MpaaRating;
        if (req.Status       is not null) movie.Status         = req.Status;
        if (req.ListingPriceVnd is not null) movie.ListingPriceVnd = NormalizeListingPrice(req.ListingPriceVnd);
        movie.UpdatedAt = DateTime.UtcNow;

        if (req.GenreIds is not null)
        {
            db.MovieGenres.RemoveRange(movie.MovieGenres);
            db.MovieGenres.AddRange(req.GenreIds.Select(gid => new MovieGenre { MovieId = movie.Id, GenreId = gid }));
        }

        await db.SaveChangesAsync();
        return (new MovieSummaryDto(
            movie.Id, movie.Title, movie.Slug, movie.PosterUrl, movie.ReleaseYear, 0, movie.ViewCount, [],
            movie.Status, null, movie.ListingPriceVnd), null);
    }

    public async Task<string?> AddCastAsync(Guid movieId, AddMovieCastRequest req, Guid userId, string requesterRole)
    {
        var movie = await db.Movies.Include(m => m.Cast).FirstOrDefaultAsync(m => m.Id == movieId);
        if (movie is null) return "Phim không tồn tại.";
        if (requesterRole != "admin" && movie.UploadedById != userId)
            return "Không có quyền.";

        var roleNorm = req.Role.Trim().ToLowerInvariant();
        if (roleNorm is not ("actor" or "director" or "writer"))
            return "Role phải là actor, director hoặc writer.";

        if (!await db.Celebrities.AnyAsync(c => c.Id == req.CelebrityId))
            return "Celebrity không tồn tại.";

        if (movie.Cast.Any(mc => mc.CelebrityId == req.CelebrityId && mc.Role == roleNorm))
            return null;

        db.MovieCast.Add(new MovieCast
        {
            MovieId        = movieId,
            CelebrityId    = req.CelebrityId,
            Role           = roleNorm,
            CharacterName  = req.CharacterName,
            Order          = req.Order,
        });
        await db.SaveChangesAsync();
        return null;
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    public async Task<(bool ok, int statusCode, string message)> DeleteAsync(Guid id, Guid? requesterId, string requesterRole)
    {
        var movie = await db.Movies.FindAsync(id);
        if (movie is null) return (false, 404, "Phim không tồn tại.");

        if (string.Equals(requesterRole, "admin", StringComparison.Ordinal))
        {
            db.Movies.Remove(movie);
            await db.SaveChangesAsync();
            return (true, 204, "");
        }

        if (requesterId is null || movie.UploadedById != requesterId)
            return (false, 403, "Không có quyền xoá phim này.");

        if (movie.Status is not ("draft" or "rejected"))
            return (false, 403, "Chỉ có thể xoá phim ở trạng thái draft hoặc rejected.");

        db.Movies.Remove(movie);
        await db.SaveChangesAsync();
        return (true, 204, "");
    }

    // ── Genres list ───────────────────────────────────────────────────────────
    public async Task<List<GenreDto>> GetGenresAsync()
    {
        const string key = "moviesocial:catalog:genres:v1";
        var cached = await catalogCache.GetAsync<List<GenreDto>>(key).ConfigureAwait(false);
        if (cached is not null) return cached;
        var list = await db.Genres.AsNoTracking()
            .OrderBy(g => g.Name)
            .Select(g => new GenreDto(g.Id, g.Name, g.Slug))
            .ToListAsync();
        await catalogCache.SetAsync(key, list).ConfigureAwait(false);
        return list;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static Task<List<MovieSummaryDto>> QuerySummaries(IQueryable<Movie> q, int limit) =>
        q.AsNoTracking().Take(limit)
         .Select(m => new MovieSummaryDto(
             m.Id, m.Title, m.Slug, m.PosterUrl, m.ReleaseYear,
             m.RatingCountCached > 0 ? Math.Round(m.AvgRatingCached, 1) : 0,
             m.ViewCount,
             m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
             null,
             null,
             m.ListingPriceVnd))
         .ToListAsync();

    private async Task<Dictionary<Guid, int>> LoadStreamEndpointCountsAsync(Movie m)
    {
        var vsIds = m.Chapters.SelectMany(c => c.VideoSources).Select(v => v.Id).ToList();
        if (vsIds.Count == 0) return [];
        return await db.VideoSourceEndpoints.AsNoTracking()
            .Where(e => vsIds.Contains(e.VideoSourceId))
            .GroupBy(e => e.VideoSourceId)
            .Select(g => new { g.Key, Cnt = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Cnt);
    }

    private async Task<MovieDetailDto> BuildDetailDtoAsync(
        Movie m,
        IEnumerable<MovieSummaryDto> related,
        Guid? viewerId,
        string? viewerRole,
        IReadOnlyDictionary<Guid, int> streamEndpointCounts)
    {
        var canPlay = await entitlements.ViewerCanPlayAsync(m, viewerId, viewerRole);
        var isPaid = EntitlementService.IsPaidListing(m);
        var purchaseRequired = isPaid && !canPlay;
        return new MovieDetailDto(
            m.Id, m.Title, m.Slug, m.Description, m.PosterUrl, m.BackdropUrl, m.TrailerUrl,
            m.ReleaseYear, m.RuntimeMinutes, m.MpaaRating, m.Status, m.ViewCount,
            m.RatingCountCached > 0 ? Math.Round(m.AvgRatingCached, 1) : 0,
            m.RatingCountCached,
            m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name, mg.Genre.Slug)),
            m.Cast.OrderBy(mc => mc.Order).Select(mc => new CastMemberDto(
                mc.CelebrityId, mc.Celebrity.Slug, mc.Celebrity.Name, mc.Celebrity.AvatarUrl, mc.Role, mc.CharacterName)),
            m.Chapters
                .OrderBy(c => c.Order)
                .Select(c => new ChapterSummaryDto(
                    c.Id, c.Title, c.Order, c.DurationSeconds, c.ThumbnailUrl,
                    c.IntroSkipEndSeconds,
                    c.SubtitleR2Key != null && c.SubtitleR2Key != "",
                    c.VideoSources.OrderBy(v => v.Quality)
                        .Select(v => new VideoSourceInfoDto(
                            v.Id, v.Quality, v.Status, streamEndpointCounts.GetValueOrDefault(v.Id))))),
            related,
            m.ListingPriceVnd,
            isPaid,
            canPlay,
            purchaseRequired);
    }

    private static int? NormalizeListingPrice(int? v)
    {
        if (!v.HasValue) return null;
        return v.Value <= 0 ? null : v.Value;
    }

    private static string GenerateSlug(string title) =>
        System.Text.RegularExpressions.Regex.Replace(title.ToLowerInvariant().Trim(), @"[^a-z0-9]+", "-").Trim('-')
        + "-" + Guid.NewGuid().ToString("N")[..6];
}
