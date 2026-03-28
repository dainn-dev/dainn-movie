using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class ChapterEndpoints
{
    public static IEndpointRouteBuilder MapChapterEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/chapters").WithTags("Chapters");

        g.MapGet("/{id:guid}/sources", async (Guid id, ChapterService ch) =>
            Results.Ok(await ch.ListSourcesAsync(id)))
            .WithSummary("Danh sách video source (chất lượng) của chapter")
            .Produces<List<VideoSourceInfoDto>>();

        g.MapGet("/{id:guid}/stream-url", async (
            Guid id,
            [FromQuery] string? quality,
            ChapterService ch) =>
        {
            var url = await ch.GetStreamUrlAsync(id, quality);
            return url is null ? Results.NotFound() : Results.Ok(new StreamUrlResponse(url));
        })
        .WithSummary("Presigned GET URL để stream (TTL ~1h)")
        .Produces<StreamUrlResponse>()
        .Produces(404);

        g.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] UpdateChapterRequest req,
            ClaimsPrincipal principal,
            ChapterService ch) =>
        {
            var userId = GetUserId(principal);
            var role   = principal.FindFirst("role")?.Value ?? "";
            if (userId is null) return Results.Unauthorized();
            var (dto, err) = await ch.UpdateAsync(id, req, userId.Value, role);
            if (err is not null) return Results.BadRequest(new { message = err });
            return Results.Ok(dto);
        })
        .WithSummary("Cập nhật chapter")
        .RequireAuthorization()
        .Produces<ChapterCreatedDto>();

        g.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal principal, ChapterService ch) =>
        {
            var userId = GetUserId(principal);
            var role   = principal.FindFirst("role")?.Value ?? "";
            if (userId is null) return Results.Unauthorized();
            var err = await ch.DeleteAsync(id, userId.Value, role);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .WithSummary("Xoá chapter")
        .RequireAuthorization()
        .Produces(204)
        .Produces(400);

        return app;
    }

    private static Guid? GetUserId(ClaimsPrincipal p)
    {
        var v = p.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
             ?? p.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return v is not null && Guid.TryParse(v, out var id) ? id : null;
    }
}
