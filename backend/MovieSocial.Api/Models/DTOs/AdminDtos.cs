namespace MovieSocial.Api.Models.DTOs;

public record AdminStatsDto(
    int Users,
    int ActiveUsers,
    int Movies,
    int PublishedMovies,
    int PendingMovies,
    int News,
    int Celebrities,
    int PendingReports);

public record AdminUserSummaryDto(
    Guid Id,
    string Username,
    string Email,
    string DisplayName,
    string Role,
    bool IsActive,
    bool IsVerified,
    DateTime CreatedAt);

public record AdminUpdateUserRequest(bool? IsActive, string? Role);

public record ModerateMovieRequest(bool Approve, string? Note);

public record AdminResolveReportRequest(string Status);

public record ContentReportAdminDto(
    Guid Id,
    Guid ReporterId,
    string ReporterUsername,
    string TargetType,
    Guid TargetId,
    string Reason,
    string Status,
    DateTime CreatedAt);
