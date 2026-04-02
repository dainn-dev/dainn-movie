using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        // POST /api/auth/register
        group.MapPost("/register", async (
            [FromBody] RegisterRequest req,
            IValidator<RegisterRequest> validator,
            AuthService authService) =>
        {
            var validation = await validator.ValidateAsync(req);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var (user, error) = await authService.RegisterAsync(req);
            if (error is not null)
                return Results.Conflict(new { message = error });

            return Results.Created("/api/auth/me", new { message = "Đăng ký thành công.", user });
        })
        .WithSummary("Đăng ký tài khoản mới (chưa cấp phiên — đăng nhập sau)")
        .ProducesValidationProblem()
        .Produces(409);

        // POST /api/auth/login
        group.MapPost("/login", async (
            HttpContext http,
            IHostEnvironment env,
            IConfiguration cfg,
            [FromBody] LoginRequest req,
            IValidator<LoginRequest> validator,
            AuthService authService) =>
        {
            var validation = await validator.ValidateAsync(req);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var (response, error) = await authService.LoginAsync(req);
            if (error is not null)
                return Results.Unauthorized();

            var days = cfg.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7);
            AuthCookieHelper.SetRefreshCookie(http.Response, response!.RefreshToken, TimeSpan.FromDays(days), env);
            return Results.Ok(new AuthTokenResponse(response.AccessToken, response.User));
        })
        .WithSummary("Đăng nhập — refresh trong cookie httpOnly (M1a)")
        .Produces<AuthTokenResponse>()
        .ProducesValidationProblem()
        .Produces(401);

        // POST /api/auth/logout  (requires auth)
        group.MapPost("/logout", async (
            ClaimsPrincipal principal,
            [FromBody] RefreshRequest req,
            HttpContext ctx,
            IHostEnvironment env,
            AuthService authService,
            PushNotificationService pushSvc) =>
        {
            var userIdClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                           ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim is not null && Guid.TryParse(userIdClaim, out var pushUid))
                await pushSvc.RemoveAllForUserAsync(pushUid);

            var authHeader  = ctx.Request.Headers.Authorization.ToString();
            var accessToken = authHeader.StartsWith("Bearer ")
                ? authHeader["Bearer ".Length..]
                : null;

            var refreshToken = string.IsNullOrWhiteSpace(req.RefreshToken)
                ? ctx.Request.Cookies[AuthCookieHelper.CookieName]
                : req.RefreshToken;

            if (!string.IsNullOrWhiteSpace(refreshToken))
                await authService.LogoutAsync(refreshToken, accessToken);

            AuthCookieHelper.ClearRefreshCookie(ctx.Response, env);
            return Results.NoContent();
        })
        .WithSummary("Đăng xuất")
        .RequireAuthorization()
        .Produces(204);

        // POST /api/auth/refresh
        group.MapPost("/refresh", async (
            HttpContext http,
            IHostEnvironment env,
            IConfiguration cfg,
            [FromBody] RefreshRequest req,
            AuthService authService) =>
        {
            var refreshToken = string.IsNullOrWhiteSpace(req.RefreshToken)
                ? http.Request.Cookies[AuthCookieHelper.CookieName]
                : req.RefreshToken;

            if (string.IsNullOrWhiteSpace(refreshToken))
                return Results.Json(
                    new { message = "Thiếu refresh token.", code = "invalid_refresh" },
                    statusCode: StatusCodes.Status401Unauthorized);

            var (response, error, code) = await authService.RefreshAsync(refreshToken);
            if (error is not null)
                return Results.Json(
                    new { message = error, code = code ?? "invalid_refresh" },
                    statusCode: StatusCodes.Status401Unauthorized);

            var days = cfg.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7);
            AuthCookieHelper.SetRefreshCookie(http.Response, response!.RefreshToken, TimeSpan.FromDays(days), env);
            return Results.Ok(new AuthTokenResponse(response.AccessToken, response.User));
        })
        .WithSummary("Làm mới access token — đọc cookie nếu body rỗng (M1a)")
        .Produces<AuthTokenResponse>()
        .Produces(statusCode: 401);

        // GET /api/auth/me  (requires auth)
        group.MapGet("/me", async (ClaimsPrincipal principal, AuthService authService) =>
        {
            var userIdClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                           ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var user = await authService.GetMeAsync(userId);
            return user is null ? Results.Unauthorized() : Results.Ok(user);
        })
        .WithSummary("Lấy thông tin user đang đăng nhập")
        .RequireAuthorization()
        .Produces<UserDto>()
        .Produces(401);

        // POST /api/auth/forgot-password
        group.MapPost("/forgot-password", async (
            [FromBody] ForgotPasswordRequest req,
            PasswordResetService resetService) =>
        {
            await resetService.InitiateAsync(req.Email);
            // Always 200 to avoid email enumeration
            return Results.Ok(new { message = "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu." });
        })
        .WithSummary("Yêu cầu đặt lại mật khẩu")
        .Produces(200);

        // POST /api/auth/reset-password
        group.MapPost("/reset-password", async (
            [FromBody] ResetPasswordRequest req,
            PasswordResetService resetService) =>
        {
            if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 8)
                return Results.BadRequest(new { message = "Mật khẩu phải có ít nhất 8 ký tự." });

            var (success, error) = await resetService.CompleteAsync(req.Token, req.NewPassword);
            if (!success)
                return Results.BadRequest(new { message = error });

            return Results.Ok(new { message = "Đặt lại mật khẩu thành công." });
        })
        .WithSummary("Xác nhận token và đặt mật khẩu mới")
        .Produces(200)
        .Produces(400);

        return app;
    }
}
