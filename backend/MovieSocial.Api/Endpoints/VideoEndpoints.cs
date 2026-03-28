using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class VideoEndpoints
{
    public static IEndpointRouteBuilder MapVideoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/videos").WithTags("Videos");

        group.MapPost("/presigned-url", async (
            [FromBody] VideoPresignRequest body,
            ClaimsPrincipal principal,
            VideoUploadService svc) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();

            var (dto, err, status) = await svc.PresignAsync(body, userId.Value).ConfigureAwait(false);
            if (err is not null)
            {
                if (status == 429) return Results.Json(new { message = err }, statusCode: 429);
                if (status == 503) return Results.Json(new { message = err }, statusCode: 503);
                if (status == 403) return Results.Json(new { message = err }, statusCode: 403);
                if (status == 404) return Results.NotFound(new { message = err });
                return Results.BadRequest(new { message = err });
            }

            return Results.Ok(dto);
        })
        .WithSummary("Presigned PUT — tải video trực tiếp lên R2")
        .RequireAuthorization()
        .Produces<VideoPresignResponse>()
        .Produces(400).Produces(401).Produces(403).Produces(404).Produces(429).Produces(503);

        group.MapPost("/confirm-upload", async (
            [FromBody] VideoConfirmRequest body,
            ClaimsPrincipal principal,
            VideoUploadService svc) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();

            var (dto, err, status) = await svc.ConfirmAsync(body, userId.Value).ConfigureAwait(false);
            if (err is not null)
            {
                if (status == 403) return Results.Json(new { message = err }, statusCode: 403);
                if (status == 404) return Results.NotFound(new { message = err });
                return Results.BadRequest(new { message = err });
            }

            return Results.Ok(dto);
        })
        .WithSummary("Xác nhận đã upload — tạo VideoSource và enqueue transcode")
        .RequireAuthorization()
        .Produces<VideoConfirmResponse>()
        .Produces(400).Produces(401).Produces(403).Produces(404);

        return app;
    }

    private static Guid? GetUserId(ClaimsPrincipal p)
    {
        var v = p.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
             ?? p.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return v is not null && Guid.TryParse(v, out var id) ? id : null;
    }
}
