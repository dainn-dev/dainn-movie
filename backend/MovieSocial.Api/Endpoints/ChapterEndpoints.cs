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

        g.MapPost("/{id:guid}/trim", async (
            Guid id,
            [FromBody] TrimChapterRequest body,
            ClaimsPrincipal principal,
            VideoProcessingService proc) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var (ok, err) = await proc.TrimChapterAsync(id, userId.Value, body.StartSeconds, body.EndSeconds);
            return ok ? Results.NoContent() : Results.BadRequest(new { message = err });
        })
        .WithSummary("M4b — cắt video chapter (FFmpeg, cần R2 + ffmpeg)")
        .RequireAuthorization()
        .Produces(204)
        .Produces(400);

        g.MapPost("/{id:guid}/poster-from-video", async (
            Guid id,
            [FromBody] ChapterPosterFromVideoRequest body,
            ClaimsPrincipal principal,
            VideoProcessingService proc) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var (ok, err, url) = await proc.CapturePosterFrameAsync(id, userId.Value, body.TimeSeconds);
            return ok ? Results.Ok(new { thumbnailUrl = url }) : Results.BadRequest(new { message = err });
        })
        .WithSummary("M4b — ảnh poster từ 1 frame video")
        .RequireAuthorization()
        .Produces(200)
        .Produces(400);

        g.MapGet("/{id:guid}/stream-url", async (
            Guid id,
            [FromQuery] string? quality,
            HttpContext ctx,
            ChapterService ch) =>
        {
            var uid = GetUserId(ctx.User);
            var role = ctx.User.FindFirst("role")?.Value;
            var gate = await ch.GetStreamUrlGateAsync(id, quality, uid, role);
            return StreamGateToResult(gate);
        })
        .WithSummary("Presigned GET URL để stream (TTL ~1h); phim trả phí cần đăng nhập + đã mua")
        .Produces<StreamUrlResponse>()
        .Produces(401)
        .Produces(403)
        .Produces(404)
        .AllowAnonymous();

        g.MapGet("/{id:guid}/subtitle-url", async (Guid id, HttpContext ctx, ChapterService ch) =>
        {
            var uid = GetUserId(ctx.User);
            var role = ctx.User.FindFirst("role")?.Value;
            var gate = await ch.GetSubtitleUrlGateAsync(id, uid, role);
            return StreamGateToResult(gate);
        })
        .WithSummary("Presigned GET URL phụ đề WebVTT (cùng quy tắc trả phí như stream)")
        .Produces<StreamUrlResponse>()
        .Produces(401)
        .Produces(403)
        .Produces(404)
        .AllowAnonymous();

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

    private static IResult StreamGateToResult(StreamUrlGate g) =>
        g.StatusCode switch
        {
            200 => Results.Ok(new StreamUrlResponse(g.Url!)),
            404 => Results.NotFound(),
            401 => Results.Json(
                new { code = "login_required", message = "Đăng nhập để xem nội dung trả phí.", movieId = g.MovieId },
                statusCode: 401),
            403 => Results.Json(
                new { code = "purchase_required", message = "Mua phim để xem toàn bộ nội dung.", movieId = g.MovieId },
                statusCode: 403),
            _ => Results.StatusCode(500),
        };
}
