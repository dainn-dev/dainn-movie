using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class CelebrityEndpoints
{
    public static IEndpointRouteBuilder MapCelebrityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/celebrities").WithTags("Celebrities");

        // GET /api/celebrities
        group.MapGet("/", async (
            [FromQuery] string? role,
            [FromQuery] string? sort,
            [FromQuery] string? q,
            [FromQuery] bool    featured,
            [FromQuery] int     page,
            [FromQuery] int     pageSize,
            CelebrityService svc) =>
        {
            var result = await svc.ListAsync(
                role, sort, page < 1 ? 1 : page, pageSize < 1 ? 20 : pageSize, featured, q);
            return Results.Ok(result);
        })
        .WithSummary("Danh sách diễn viên / đạo diễn")
        .Produces<PagedResult<CelebrityListDto>>();

        // GET /api/celebrities/{slug}
        group.MapGet("/{slug}", async (string slug, CelebrityService svc) =>
        {
            var result = await svc.GetDetailAsync(slug);
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithSummary("Chi tiết celebrity theo slug")
        .Produces<CelebrityDetailDto>()
        .Produces(404);

        return app;
    }
}
