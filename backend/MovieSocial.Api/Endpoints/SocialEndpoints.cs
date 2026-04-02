using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using MovieSocial.Api.Hubs;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Options;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class SocialEndpoints
{
    public static IEndpointRouteBuilder MapSocialEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/social").WithTags("Social");

        group.MapGet("/push/vapid-public-key", (IOptions<WebPushOptions> o) =>
        {
            var w = o.Value;
            if (!w.IsConfigured)
            {
                return Results.Json(
                    new { configured = false, publicKey = (string?)null },
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }

            return Results.Ok(new { configured = true, publicKey = w.PublicKey.Trim() });
        })
        .WithSummary("VAPID public key — Web Push (M9-T10)")
        .AllowAnonymous();

        group.MapPost("/push/subscribe", async (
            [FromBody] SavePushSubscriptionRequest body,
            ClaimsPrincipal principal,
            PushNotificationService push) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            if (!push.IsConfigured)
                return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
            await push.SaveSubscriptionAsync(uid.Value, body);
            return Results.NoContent();
        })
        .WithSummary("Lưu Web Push subscription cho thiết bị hiện tại")
        .RequireAuthorization()
        .Produces(204)
        .Produces(503);

        group.MapDelete("/push/subscription", async (ClaimsPrincipal principal, PushNotificationService push) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            await push.RemoveAllForUserAsync(uid.Value);
            return Results.NoContent();
        })
        .WithSummary("Huỷ toàn bộ Web Push subscription của user (thiết bị đăng ký)")
        .RequireAuthorization()
        .Produces(204);

        group.MapPost("/push/unsubscribe", async (
            [FromBody] UnsubscribePushRequest body,
            ClaimsPrincipal principal,
            PushNotificationService push) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(body.Endpoint))
                await push.RemoveAllForUserAsync(uid.Value);
            else
                await push.RemoveByEndpointAsync(uid.Value, body.Endpoint);
            return Results.NoContent();
        })
        .WithSummary("Huỷ một subscription (body.endpoint) hoặc tất cả nếu endpoint rỗng")
        .RequireAuthorization()
        .Produces(204);

        group.MapGet("/users/search", async (string? q, ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(q)) return Results.Ok(Array.Empty<UserSearchResultDto>());
            return Results.Ok(await svc.SearchUsersAsync(uid.Value, q));
        })
        .WithSummary("Tìm user để kết bạn / nhắn tin")
        .RequireAuthorization();

        group.MapPost("/friend-requests", async (
            [FromBody] SendFriendRequestRequest body,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var err = await svc.SendFriendRequestAsync(uid.Value, body.ReceiverUsername);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .WithSummary("Gửi lời mời kết bạn")
        .RequireAuthorization()
        .Produces(204).Produces(400);

        group.MapGet("/friend-requests/incoming", async (ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(await svc.ListIncomingRequestsAsync(uid.Value));
        })
        .RequireAuthorization();

        group.MapGet("/friend-requests/outgoing", async (ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(await svc.ListOutgoingRequestsAsync(uid.Value));
        })
        .RequireAuthorization();

        group.MapPost("/friend-requests/{requestId:guid}/accept", async (
            Guid requestId,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var err = await svc.AcceptFriendRequestAsync(requestId, uid.Value);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204).Produces(400);

        group.MapPost("/friend-requests/{requestId:guid}/reject", async (
            Guid requestId,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var err = await svc.RejectFriendRequestAsync(requestId, uid.Value);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204).Produces(400);

        group.MapGet("/friends", async (ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(await svc.ListFriendsAsync(uid.Value));
        })
        .RequireAuthorization();

        group.MapDelete("/friends/{friendId:guid}", async (
            Guid friendId,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var err = await svc.RemoveFriendAsync(uid.Value, friendId);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204).Produces(400);

        group.MapPost("/messages", async (
            [FromBody] SendMessageRequest body,
            ClaimsPrincipal principal,
            SocialService svc,
            IHubContext<ChatHub> hub) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var (dto, err) = await svc.SendMessageAsync(uid.Value, body);
            if (err is not null) return Results.BadRequest(new { message = err });
            await hub.Clients.Group(ChatHub.UserGroup(body.ReceiverId.ToString())).SendAsync("message", dto);
            return Results.Ok(dto);
        })
        .WithSummary("Gửi tin nhắn (REST + SignalR push)")
        .RequireAuthorization()
        .Produces<MessageDto>();

        group.MapGet("/messages/{otherUserId:guid}", async (
            Guid otherUserId,
            [FromQuery] int page,
            [FromQuery] int pageSize,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var result = await svc.ListConversationAsync(uid.Value, otherUserId, page, pageSize);
            return Results.Ok(result);
        })
        .RequireAuthorization();

        group.MapPost("/messages/{otherUserId:guid}/read", async (
            Guid otherUserId,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            await svc.MarkConversationReadAsync(uid.Value, otherUserId);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204);

        group.MapGet("/notifications", async (ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(await svc.ListNotificationsAsync(uid.Value));
        })
        .RequireAuthorization();

        group.MapGet("/notifications/unread-count", async (ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(new { count = await svc.UnreadNotificationCountAsync(uid.Value) });
        })
        .RequireAuthorization();

        group.MapPost("/notifications/{id:guid}/read", async (
            Guid id,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var err = await svc.MarkNotificationReadAsync(uid.Value, id);
            return err is not null ? Results.NotFound(new { message = err }) : Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204).Produces(404);

        group.MapPost("/notifications/read-all", async (ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            await svc.MarkAllNotificationsReadAsync(uid.Value);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204);

        group.MapPost("/watchlist/{movieId:guid}", async (Guid movieId, ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var err = await svc.AddWatchlistAsync(uid.Value, movieId);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204).Produces(400);

        group.MapDelete("/watchlist/{movieId:guid}", async (Guid movieId, ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            await svc.RemoveWatchlistAsync(uid.Value, movieId);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204);

        group.MapGet("/watchlist", async (ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(await svc.ListWatchlistAsync(uid.Value));
        })
        .RequireAuthorization();

        group.MapGet("/watchlist/contains/{movieId:guid}", async (
            Guid movieId,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(new { onList = await svc.WatchlistContainsAsync(uid.Value, movieId) });
        })
        .RequireAuthorization();

        group.MapPost("/movies/{movieId:guid}/follow", async (Guid movieId, ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var err = await svc.FollowMovieAsync(uid.Value, movieId);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .WithSummary("Theo dõi phim — thông báo tập mới cho phim miễn phí; phim trả phí chỉ gửi cho người đã mua")
        .RequireAuthorization()
        .Produces(204).Produces(400);

        group.MapDelete("/movies/{movieId:guid}/follow", async (Guid movieId, ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            await svc.UnfollowMovieAsync(uid.Value, movieId);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204);

        group.MapGet("/movies/{movieId:guid}/follow", async (Guid movieId, ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(new { following = await svc.MovieFollowContainsAsync(uid.Value, movieId) });
        })
        .WithSummary("Trạng thái theo dõi phim")
        .RequireAuthorization();

        group.MapPost("/watch-history", async (
            [FromBody] RecordWatchHistoryRequest body,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            await svc.RecordWatchHistoryAsync(uid.Value, body);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204);

        group.MapGet("/watch-history", async (ClaimsPrincipal principal, SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(await svc.ListWatchHistoryAsync(uid.Value));
        })
        .RequireAuthorization();

        group.MapGet("/watch-progress", async (
            [FromQuery] Guid movieId,
            [FromQuery] Guid chapterId,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var sec = await svc.GetWatchProgressSecondsAsync(uid.Value, movieId, chapterId);
            return Results.Ok(new WatchProgressDto(sec));
        })
        .WithSummary("Tiến độ xem gần nhất cho movieId + chapterId (resume)")
        .RequireAuthorization()
        .Produces<WatchProgressDto>();

        group.MapPost("/reports", async (
            [FromBody] SubmitReportRequest body,
            ClaimsPrincipal principal,
            SocialService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var err = await svc.SubmitReportAsync(uid.Value, body);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .RequireAuthorization()
        .Produces(204).Produces(400);

        return app;
    }

    private static Guid? GetUserId(ClaimsPrincipal p)
    {
        var v = p.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
             ?? p.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return v is not null && Guid.TryParse(v, out var id) ? id : null;
    }
}
