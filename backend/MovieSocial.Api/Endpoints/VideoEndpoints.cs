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

        group.MapPost("/subtitle-presigned-url", async (
            [FromBody] SubtitlePresignRequest body,
            ClaimsPrincipal principal,
            VideoUploadService svc) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var (dto, err, status) = await svc.PresignSubtitleAsync(body, userId.Value).ConfigureAwait(false);
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
        .WithSummary("M4b — presigned PUT upload file .vtt")
        .RequireAuthorization()
        .Produces<VideoPresignResponse>();

        group.MapGet("/video-sources/{videoSourceId:guid}/stream-endpoints", async (
            Guid videoSourceId,
            ClaimsPrincipal principal,
            StreamEndpointService streamEp) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var role = GetRole(principal);
            var (items, err, status) = await streamEp.ListAsync(videoSourceId, userId.Value, role).ConfigureAwait(false);
            if (err is not null)
                return Results.Json(new { message = err }, statusCode: status);
            return Results.Ok(items);
        })
        .WithSummary("Danh sách điểm phát thêm (mirror / URL) cho một VideoSource")
        .RequireAuthorization()
        .Produces<List<StreamEndpointDto>>();

        group.MapPost("/video-sources/{videoSourceId:guid}/stream-endpoints", async (
            Guid videoSourceId,
            [FromBody] CreateStreamEndpointRequest body,
            ClaimsPrincipal principal,
            StreamEndpointService streamEp) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var role = GetRole(principal);
            var (dto, err, status) = await streamEp.CreateAsync(videoSourceId, userId.Value, role, body).ConfigureAwait(false);
            if (err is not null)
                return Results.Json(new { message = err }, statusCode: status);
            return Results.Ok(dto);
        })
        .WithSummary("Thêm điểm phát thay thế (r2Key hoặc directUrl, sortOrder)")
        .RequireAuthorization()
        .Produces<StreamEndpointDto>(200)
        .Produces(400).Produces(403).Produces(404);

        group.MapDelete("/video-sources/stream-endpoints/{endpointId:guid}", async (
            Guid endpointId,
            ClaimsPrincipal principal,
            StreamEndpointService streamEp) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var role = GetRole(principal);
            var (ok, err, status) = await streamEp.DeleteAsync(endpointId, userId.Value, role).ConfigureAwait(false);
            if (!ok)
                return Results.Json(new { message = err }, statusCode: status);
            return Results.NoContent();
        })
        .WithSummary("Xoá một điểm phát thay thế")
        .RequireAuthorization()
        .Produces(204)
        .Produces(403).Produces(404);

        group.MapPost("/confirm-subtitle", async (
            [FromBody] SubtitleConfirmRequest body,
            ClaimsPrincipal principal,
            VideoUploadService svc) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var (ok, err, status) = await svc.ConfirmSubtitleAsync(body, userId.Value).ConfigureAwait(false);
            if (!ok)
            {
                if (status == 403) return Results.Json(new { message = err }, statusCode: 403);
                if (status == 404) return Results.NotFound(new { message = err });
                return Results.BadRequest(new { message = err });
            }
            return Results.NoContent();
        })
        .WithSummary("M4b — xác nhận phụ đề đã upload")
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

    private static string GetRole(ClaimsPrincipal p) =>
        p.FindFirst("role")?.Value ?? "user";
}
