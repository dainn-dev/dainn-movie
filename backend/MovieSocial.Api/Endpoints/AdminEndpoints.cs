using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Services;

namespace MovieSocial.Api.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin").WithTags("Admin").RequireAuthorization("AdminOnly");

        group.MapGet("/stats", async (AdminService svc) => Results.Ok(await svc.GetStatsAsync()))
            .WithSummary("Thống kê dashboard")
            .Produces<AdminStatsDto>();

        group.MapGet("/users", async (
            [FromQuery] int page,
            [FromQuery] int pageSize,
            [FromQuery] string? q,
            AdminService svc) =>
            Results.Ok(await svc.ListUsersAsync(page, pageSize, q)))
            .Produces<PagedResult<AdminUserSummaryDto>>();

        group.MapPatch("/users/{id:guid}", async (
            Guid id,
            [FromBody] AdminUpdateUserRequest body,
            AdminService svc) =>
        {
            var (dto, err) = await svc.UpdateUserAsync(id, body);
            if (err is not null) return Results.BadRequest(new { message = err });
            return Results.Ok(dto);
        })
            .Produces<AdminUserSummaryDto>()
            .Produces(400);

        group.MapGet("/movies/pending", async (
            [FromQuery] int page,
            [FromQuery] int pageSize,
            AdminService svc) =>
            Results.Ok(await svc.ListPendingMoviesAsync(page, pageSize)))
            .Produces<PagedResult<MovieSummaryDto>>();

        group.MapPost("/movies/{id:guid}/moderate", async (
            Guid id,
            [FromBody] ModerateMovieRequest body,
            AdminService svc) =>
        {
            var err = await svc.ModerateMovieAsync(id, body);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
            .Produces(204).Produces(400);

        group.MapGet("/reports", async (
            [FromQuery] int page,
            [FromQuery] int pageSize,
            AdminService svc) =>
            Results.Ok(await svc.ListPendingReportsAsync(page, pageSize)))
            .Produces<PagedResult<ContentReportAdminDto>>();

        group.MapPost("/reports/{id:guid}/resolve", async (
            Guid id,
            [FromBody] AdminResolveReportRequest body,
            AdminService svc) =>
        {
            var err = await svc.ResolveReportAsync(id, body);
            return err is not null ? Results.BadRequest(new { message = err }) : Results.NoContent();
        })
            .Produces(204).Produces(400);

        return app;
    }
}
