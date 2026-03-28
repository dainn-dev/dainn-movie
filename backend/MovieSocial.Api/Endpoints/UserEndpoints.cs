using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users").WithTags("Users");

        // GET /api/users/{username} — public profile
        group.MapGet("/{username}", async (string username, UserService userService) =>
        {
            var profile = await userService.GetPublicProfileAsync(username);
            return profile is null ? Results.NotFound() : Results.Ok(profile);
        })
        .WithSummary("Xem public profile của user")
        .Produces<PublicProfileDto>()
        .Produces(404);

        // PUT /api/users/me — update own profile
        group.MapPut("/me", async (
            [FromBody] UpdateProfileRequest req,
            ClaimsPrincipal principal,
            UserService userService) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();

            var (result, error) = await userService.UpdateProfileAsync(userId.Value, req);
            if (error is not null) return Results.NotFound(new { message = error });

            return Results.Ok(result);
        })
        .WithSummary("Cập nhật profile của mình")
        .RequireAuthorization()
        .Produces<UserDto>()
        .Produces(401)
        .Produces(404);

        // POST /api/users/me/avatar — get presigned R2 upload URL
        group.MapPost("/me/avatar", async (
            [FromQuery] string filename,
            ClaimsPrincipal principal,
            UserService userService) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();

            var result = await userService.GetAvatarUploadUrlAsync(userId.Value, filename);
            return Results.Ok(result);
        })
        .WithSummary("Lấy presigned URL để upload avatar lên R2")
        .RequireAuthorization()
        .Produces<AvatarUploadUrlResponse>()
        .Produces(401);

        // GET /api/users/me/stats — own stats
        group.MapGet("/me/stats", async (
            ClaimsPrincipal principal,
            UserService userService) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();

            var stats = await userService.GetStatsAsync(userId.Value);
            return Results.Ok(stats);
        })
        .WithSummary("Thống kê của bản thân")
        .RequireAuthorization()
        .Produces<UserStatsDto>()
        .Produces(401);

        return app;
    }

    private static Guid? GetUserId(ClaimsPrincipal principal)
    {
        var value = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                 ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return value is not null && Guid.TryParse(value, out var id) ? id : null;
    }
}
