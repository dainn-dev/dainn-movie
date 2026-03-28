using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class MovieEndpoints
{
    public static IEndpointRouteBuilder MapMovieEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/movies").WithTags("Movies");

        // GET /api/movies/genres
        group.MapGet("/genres", async (MovieService svc) => Results.Ok(await svc.GetGenresAsync()))
            .WithSummary("Lấy danh sách thể loại")
            .Produces<List<GenreDto>>();

        // GET /api/movies/featured
        group.MapGet("/featured", async ([FromQuery] int limit, MovieService svc) =>
            Results.Ok(await svc.GetFeaturedAsync(limit < 1 ? 6 : limit)))
            .WithSummary("Phim nổi bật (slider homepage)")
            .Produces<List<MovieSummaryDto>>();

        // GET /api/movies/popular
        group.MapGet("/popular", async ([FromQuery] int limit, MovieService svc) =>
            Results.Ok(await svc.GetPopularAsync(limit < 1 ? 20 : limit)))
            .WithSummary("Phim phổ biến")
            .Produces<List<MovieSummaryDto>>();

        // GET /api/movies/latest
        group.MapGet("/latest", async ([FromQuery] int limit, MovieService svc) =>
            Results.Ok(await svc.GetLatestAsync(limit < 1 ? 20 : limit)))
            .WithSummary("Phim mới nhất")
            .Produces<List<MovieSummaryDto>>();

        // GET /api/movies/trailers
        group.MapGet("/trailers", async ([FromQuery] int limit, MovieService svc) =>
            Results.Ok(await svc.GetTrailersAsync(limit < 1 ? 6 : limit)))
            .WithSummary("Phim có trailer (homepage)")
            .Produces<List<MovieTrailerDto>>();

        // ── Per-movie: chapters, reviews, ratings, favorites (before /{id}) ──

        group.MapGet("/{movieId:guid}/chapters", async (HttpContext ctx, Guid movieId, ChapterService ch) =>
        {
            var uid = GetUserId(ctx.User);
            var role = ctx.User.FindFirst("role")?.Value;
            return Results.Ok(await ch.ListForMovieAsync(movieId, uid, role));
        })
            .WithSummary("Danh sách chapter")
            .Produces<List<ChapterSummaryDto>>();

        group.MapPost("/{movieId:guid}/chapters", async (
            Guid movieId,
            [FromBody] CreateChapterRequest req,
            ClaimsPrincipal principal,
            ChapterService ch) =>
        {
            var userId = GetUserId(principal);
            var role   = principal.FindFirst("role")?.Value ?? "";
            if (userId is null) return Results.Unauthorized();
            var (dto, err) = await ch.CreateAsync(movieId, req, userId.Value, role);
            if (err is not null) return Results.BadRequest(new { message = err });
            return Results.Created($"/api/chapters/{dto!.Id}", dto);
        })
        .WithSummary("Thêm chapter (owner / admin)")
        .RequireAuthorization()
        .Produces<ChapterCreatedDto>(201);

        group.MapGet("/{movieId:guid}/reviews", async (
            Guid movieId,
            [FromQuery] int page,
            [FromQuery] int pageSize,
            ReviewRatingService reviews) =>
        {
            var result = await reviews.ListReviewsAsync(movieId, page, pageSize);
            return Results.Ok(result);
        })
        .WithSummary("Reviews phim (phân trang)")
        .Produces<PagedResult<ReviewDto>>();

        group.MapPost("/{movieId:guid}/reviews", async (
            Guid movieId,
            [FromBody] CreateReviewRequest req,
            ClaimsPrincipal principal,
            ReviewRatingService reviews) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var (dto, err, status) = await reviews.UpsertReviewAsync(movieId, userId.Value, req);
            if (err is not null)
                return status == 404
                    ? Results.NotFound(new { message = err })
                    : Results.BadRequest(new { message = err });
            return status == 201
                ? Results.Created($"/api/reviews/{dto!.Id}", dto)
                : Results.Ok(dto);
        })
        .WithSummary("Tạo/cập nhật review của bạn (1 review / phim)")
        .RequireAuthorization()
        .Produces<ReviewDto>(201)
        .Produces<ReviewDto>(200);

        group.MapPost("/{movieId:guid}/rate", async (
            Guid movieId,
            [FromBody] RateMovieRequest req,
            ClaimsPrincipal principal,
            ReviewRatingService reviews) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var err = await reviews.RateMovieAsync(movieId, userId.Value, req.Score);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .WithSummary("Cho điểm phim (1–10)")
        .RequireAuthorization()
        .Produces(204);

        group.MapGet("/{movieId:guid}/rating", async (Guid movieId, ReviewRatingService reviews) =>
        {
            var r = await reviews.GetRatingAsync(movieId);
            return r is null ? Results.NotFound() : Results.Ok(r);
        })
        .WithSummary("Trung bình điểm + số lượt vote")
        .Produces<MovieRatingResponse>()
        .Produces(404);

        group.MapGet("/{movieId:guid}/favorite", async (
            Guid movieId,
            ClaimsPrincipal principal,
            MovieService movies) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Ok(new { isFavorite = false });
            return Results.Ok(new { isFavorite = await movies.IsFavoriteAsync(movieId, userId.Value) });
        })
        .WithSummary("Đã yêu thích? (khách = false)")
        .Produces<object>();

        group.MapPost("/{movieId:guid}/favorite", async (
            Guid movieId,
            ClaimsPrincipal principal,
            MovieService movies) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var err = await movies.AddFavoriteAsync(movieId, userId.Value);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .WithSummary("Thêm vào yêu thích")
        .RequireAuthorization()
        .Produces(204);

        group.MapDelete("/{movieId:guid}/favorite", async (
            Guid movieId,
            ClaimsPrincipal principal,
            MovieService movies) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            await movies.RemoveFavoriteAsync(movieId, userId.Value);
            return Results.NoContent();
        })
        .WithSummary("Bỏ yêu thích")
        .RequireAuthorization()
        .Produces(204);

        // GET /api/movies
        group.MapGet("/", async (
            [FromQuery] string? genre,
            [FromQuery] int?    year,
            [FromQuery] string? sort,
            [FromQuery] string? uploadedBy,
            [FromQuery] int     page,
            [FromQuery] int     pageSize,
            ClaimsPrincipal principal,
            MovieService svc) =>
        {
            if (string.Equals(uploadedBy, "me", StringComparison.OrdinalIgnoreCase))
            {
                var uid = GetUserId(principal);
                if (uid is null) return Results.Unauthorized();
                var mine = await svc.ListMyUploadedAsync(uid.Value, page < 1 ? 1 : page, pageSize < 1 ? 20 : pageSize);
                return Results.Ok(mine);
            }

            var result = await svc.ListAsync(genre, year, sort, page < 1 ? 1 : page, pageSize < 1 ? 20 : pageSize);
            return Results.Ok(result);
        })
        .WithSummary("Danh sách phim có filter + phân trang; uploadedBy=me cần JWT")
        .Produces<PagedResult<MovieSummaryDto>>()
        .Produces(401);

        group.MapPost("/{movieId:guid}/cast", async (
            Guid movieId,
            [FromBody] AddMovieCastRequest req,
            ClaimsPrincipal principal,
            MovieService svc) =>
        {
            var userId = GetUserId(principal);
            var role = principal.FindFirst("role")?.Value ?? "";
            if (userId is null) return Results.Unauthorized();
            var err = await svc.AddCastAsync(movieId, req, userId.Value, role);
            if (err is null) return Results.NoContent();
            if (err.Contains("không tồn tại")) return Results.NotFound(new { message = err });
            if (err.Contains("Không có quyền")) return Results.Forbid();
            return Results.BadRequest(new { message = err });
        })
        .WithSummary("Thêm diễn viên / đạo diễn cho phim (owner / admin)")
        .RequireAuthorization()
        .Produces(204).Produces(400).Produces(401).Produces(403).Produces(404);

        // GET /api/movies/{id}
        group.MapGet("/{id:guid}", async (HttpContext ctx, Guid id, MovieService svc) =>
        {
            var uid = GetUserId(ctx.User);
            var role = ctx.User.FindFirst("role")?.Value;
            var movie = await svc.GetDetailAsync(id, uid, role);
            return movie is null ? Results.NotFound() : Results.Ok(movie);
        })
        .WithSummary("Chi tiết phim theo ID")
        .Produces<MovieDetailDto>()
        .Produces(404);

        // GET /api/movies/slug/{slug}
        group.MapGet("/slug/{slug}", async (string slug, MovieService svc) =>
        {
            var movie = await svc.GetDetailBySlugAsync(slug);
            return movie is null ? Results.NotFound() : Results.Ok(movie);
        })
        .WithSummary("Chi tiết phim theo slug")
        .Produces<MovieDetailDto>()
        .Produces(404);

        // POST /api/movies
        group.MapPost("/", async (
            [FromBody] CreateMovieRequest req,
            ClaimsPrincipal principal,
            MovieService svc) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var result = await svc.CreateAsync(req, userId.Value);
            return Results.Created($"/api/movies/{result.Id}", result);
        })
        .WithSummary("Tạo phim mới")
        .RequireAuthorization()
        .Produces<MovieSummaryDto>(201)
        .Produces(401);

        // PUT /api/movies/{id}
        group.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] UpdateMovieRequest req,
            ClaimsPrincipal principal,
            MovieService svc) =>
        {
            var userId = GetUserId(principal);
            var role   = principal.FindFirst("role")?.Value ?? "";
            if (userId is null) return Results.Unauthorized();
            var (result, error) = await svc.UpdateAsync(id, req, userId.Value, role);
            if (error is not null)
            {
                if (error.Contains("không tồn tại")) return Results.NotFound(new { message = error });
                if (error.Contains("quyền")) return Results.Forbid();
                return Results.BadRequest(new { message = error });
            }
            return Results.Ok(result);
        })
        .WithSummary("Cập nhật phim")
        .RequireAuthorization()
        .Produces<MovieSummaryDto>()
        .Produces(401).Produces(403);

        // DELETE /api/movies/{id}
        group.MapDelete("/{id:guid}", async (
            Guid id,
            ClaimsPrincipal principal,
            MovieService svc) =>
        {
            var role = principal.FindFirst("role")?.Value ?? "";
            var uid = GetUserId(principal);
            var (ok, code, message) = await svc.DeleteAsync(id, uid, role);
            if (ok) return Results.NoContent();
            if (code == 404) return Results.NotFound(new { message });
            return Results.Json(new { message }, statusCode: code);
        })
        .WithSummary("Xoá phim (admin: mọi trạng thái; owner: chỉ draft/rejected)")
        .RequireAuthorization()
        .Produces(204).Produces(403).Produces(404);

        return app;
    }

    private static Guid? GetUserId(ClaimsPrincipal p)
    {
        var v = p.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
             ?? p.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return v is not null && Guid.TryParse(v, out var id) ? id : null;
    }
}
