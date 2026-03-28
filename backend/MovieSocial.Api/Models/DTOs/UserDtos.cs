namespace MovieSocial.Api.Models.DTOs;

// GET /api/users/{username}
public record PublicProfileDto(
    Guid     Id,
    string   Username,
    string   DisplayName,
    string?  AvatarUrl,
    string?  Bio,
    DateTime JoinedAt,
    UserStatsDto Stats
);

// GET /api/users/me/stats
public record UserStatsDto(
    int MoviesUploaded,
    int Friends,
    int Reviews
);

// PUT /api/users/me
public record UpdateProfileRequest(
    string?  DisplayName,
    string?  Bio
);

// POST /api/users/me/avatar — response
public record AvatarUploadUrlResponse(
    string UploadUrl,
    string PublicUrl
);
