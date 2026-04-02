using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class PurchaseEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/purchases").WithTags("Purchases");

        g.MapPost("/checkout", async (
            [FromBody] CheckoutRequest body,
            ClaimsPrincipal principal,
            PurchaseService svc) =>
        {
            var uid = GetUserId(principal);
            var role = principal.FindFirst("role")?.Value ?? "";
            if (uid is null) return Results.Unauthorized();
            var (dto, err, status) = await svc.CheckoutAsync(uid.Value, role, body);
            if (dto is null)
                return status == 404 ? Results.NotFound(new { message = err }) : Results.BadRequest(new { message = err });
            return Results.Ok(dto);
        })
        .WithSummary("Tạo đơn mua phim (M8b — mock / cổng VN sau)")
        .RequireAuthorization()
        .Produces<CheckoutResponseDto>()
        .Produces(400)
        .Produces(401)
        .Produces(404);

        g.MapPost("/{purchaseId:guid}/mock-complete", async (
            Guid purchaseId,
            ClaimsPrincipal principal,
            PurchaseService svc) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var (ok, err) = await svc.MockCompleteAsync(purchaseId, uid.Value);
            if (!ok) return Results.BadRequest(new { message = err });
            return Results.NoContent();
        })
        .WithSummary("Hoàn tất thanh toán giả lập (chỉ khi Marketplace:MockCheckoutEnabled=true)")
        .RequireAuthorization()
        .Produces(204)
        .Produces(400)
        .Produces(401);

        g.MapGet("/me", async (ClaimsPrincipal principal, PurchaseService svc, [FromQuery] int limit) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var n = limit < 1 ? 50 : limit;
            return Results.Ok(await svc.ListForUserAsync(uid.Value, n));
        })
        .WithSummary("Lịch sử đơn mua của tôi")
        .RequireAuthorization()
        .Produces<List<PurchaseListItemDto>>();

        g.MapGet("/sales", async (ClaimsPrincipal principal, PurchaseService svc, [FromQuery] int limit) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var n = limit < 1 ? 50 : limit;
            var (dto, err) = await svc.ListCreatorSalesAsync(uid.Value, n);
            if (dto is null) return Results.BadRequest(new { message = err });
            return Results.Ok(dto);
        })
        .WithSummary("Doanh thu / đơn liên quan phim của tôi (creator)")
        .RequireAuthorization()
        .Produces<CreatorSalesResponseDto>();

        g.MapGet("/payout-balance", async (ClaimsPrincipal principal, PayoutService payouts) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            return Results.Ok(await payouts.GetBalanceAsync(uid.Value));
        })
        .WithSummary("Số dư rút tiền (creator) — M8 phase 2")
        .RequireAuthorization()
        .Produces<CreatorPayoutBalanceDto>();

        g.MapGet("/payout-requests/me", async (
            ClaimsPrincipal principal,
            PayoutService payouts,
            [FromQuery] int limit) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var n = limit < 1 ? 50 : limit;
            return Results.Ok(await payouts.ListForCreatorAsync(uid.Value, n));
        })
        .WithSummary("Lịch sử yêu cầu rút tiền")
        .RequireAuthorization()
        .Produces<List<PayoutRequestItemDto>>();

        g.MapPost("/payout-requests", async (
            [FromBody] CreatePayoutRequestBody body,
            ClaimsPrincipal principal,
            PayoutService payouts) =>
        {
            var uid = GetUserId(principal);
            if (uid is null) return Results.Unauthorized();
            var (dto, err) = await payouts.CreateRequestAsync(uid.Value, body);
            if (dto is null) return Results.BadRequest(new { message = err });
            return Results.Ok(dto);
        })
        .WithSummary("Tạo yêu cầu rút tiền (một pending tại một thời điểm)")
        .RequireAuthorization()
        .Produces<PayoutRequestItemDto>()
        .Produces(400);

        g.MapGet("/{purchaseId:guid}", async (
            Guid purchaseId,
            ClaimsPrincipal principal,
            PurchaseService svc) =>
        {
            var uid = GetUserId(principal);
            var role = principal.FindFirst("role")?.Value ?? "";
            if (uid is null) return Results.Unauthorized();
            var (dto, err, status) = await svc.GetDetailForPartyAsync(purchaseId, uid.Value, role);
            if (dto is null)
                return status == 404 ? Results.NotFound(new { message = err }) : Results.Json(new { message = err }, statusCode: status);
            return Results.Ok(dto);
        })
        .WithSummary("Chi tiết đơn (người mua / chủ phim / admin)")
        .RequireAuthorization()
        .Produces<PurchaseDetailDto>()
        .Produces(403)
        .Produces(404);

        g.MapPost("/webhooks/payment", async (
            HttpContext http,
            [FromBody] WebhookPaymentNotifyDto body,
            PurchaseService svc) =>
        {
            var secret = http.Request.Headers["X-Webhook-Secret"].ToString();
            var idem   = http.Request.Headers["Idempotency-Key"].ToString();
            var (ok, dup, err, status) = await svc.ProcessWebhookPaymentAsync(secret, idem, body);
            if (!ok)
                return Results.Json(new { message = err }, statusCode: status);
            return Results.Ok(new { ok = true, duplicate = dup });
        })
        .WithSummary("Webhook xác nhận thanh toán (bảo mật X-Webhook-Secret + Idempotency-Key)")
        .AllowAnonymous()
        .Produces(200)
        .Produces(400)
        .Produces(401)
        .Produces(404)
        .Produces(503);

        return app;
    }

    private static Guid? GetUserId(ClaimsPrincipal p)
    {
        var v = p.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
             ?? p.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return v is not null && Guid.TryParse(v, out var id) ? id : null;
    }
}
