using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class NewsEndpoints
{
    public static IEndpointRouteBuilder MapNewsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/news").WithTags("News");

        // GET /api/news
        group.MapGet("/", async (
            [FromQuery] string? tag,
            [FromQuery] int     page,
            [FromQuery] int     pageSize,
            NewsService svc) =>
        {
            var result = await svc.ListAsync(tag, page < 1 ? 1 : page, pageSize < 1 ? 20 : pageSize);
            return Results.Ok(result);
        })
        .WithSummary("Danh sách bài viết tin tức")
        .Produces<PagedResult<NewsListDto>>();

        // GET /api/news/{slug}
        group.MapGet("/{slug}", async (string slug, NewsService svc) =>
        {
            var result = await svc.GetBySlugAsync(slug);
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithSummary("Chi tiết bài viết theo slug")
        .Produces<NewsDetailDto>()
        .Produces(404);

        return app;
    }
}
