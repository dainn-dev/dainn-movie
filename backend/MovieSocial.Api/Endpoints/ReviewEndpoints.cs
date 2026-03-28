using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class ReviewEndpoints
{
    public static IEndpointRouteBuilder MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/reviews").WithTags("Reviews");

        g.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] UpdateReviewRequest req,
            ClaimsPrincipal principal,
            ReviewRatingService svc) =>
        {
            var userId = GetUserId(principal);
            if (userId is null) return Results.Unauthorized();
            var (dto, err) = await svc.UpdateReviewAsync(id, userId.Value, req);
            if (err is not null) return Results.BadRequest(new { message = err });
            return Results.Ok(dto);
        })
        .WithSummary("Sửa review của mình")
        .RequireAuthorization()
        .Produces<ReviewDto>();

        g.MapDelete("/{id:guid}", async (
            Guid id,
            ClaimsPrincipal principal,
            ReviewRatingService svc) =>
        {
            var userId = GetUserId(principal);
            var role   = principal.FindFirst("role")?.Value ?? "";
            if (userId is null) return Results.Unauthorized();
            var err = await svc.DeleteReviewAsync(id, userId.Value, role);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
        .WithSummary("Xoá review")
        .RequireAuthorization()
        .Produces(204);

        return app;
    }

    private static Guid? GetUserId(ClaimsPrincipal p)
    {
        var v = p.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
             ?? p.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return v is not null && Guid.TryParse(v, out var id) ? id : null;
    }
}
