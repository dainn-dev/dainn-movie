using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class SearchEndpoints
{
    public static IEndpointRouteBuilder MapSearchEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/search", async (
            [FromQuery] string  q,
            [FromQuery] string? type,
            [FromQuery] int     page,
            [FromQuery] int     pageSize,
            [FromQuery] int     limit,
            SearchService svc) =>
        {
            if (string.IsNullOrWhiteSpace(q))
                return Results.BadRequest(new { message = "Query không được để trống." });

            // Back-compat: `limit` alone => page 1
            var effectivePage     = page < 1 ? 1 : page;
            var effectivePageSize = pageSize > 0 ? pageSize : (limit > 0 ? limit : 10);
            var result = await svc.SearchAsync(q, type, effectivePage, effectivePageSize);
            return Results.Ok(result);
        })
        .WithTags("Search")
        .WithSummary("Tìm kiếm phim, diễn viên, tin tức")
        .Produces<SearchResultDto>()
        .Produces(400);

        return app;
    }
}
