using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;

namespace MovieSocial.Api.Services;

public class UserService(AppDbContext db)
{
    // ── Public profile ────────────────────────────────────────────────────────
    public async Task<PublicProfileDto?> GetPublicProfileAsync(string username)
    {
        var user = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

        if (user is null) return null;

        var stats = await BuildStatsAsync(user.Id);
        return new PublicProfileDto(
            user.Id,
            user.Username,
            user.DisplayName,
            user.AvatarUrl,
            user.Bio,
            user.CreatedAt,
            stats);
    }

    // ── Update profile ────────────────────────────────────────────────────────
    public async Task<(UserDto? result, string? error)> UpdateProfileAsync(Guid userId, UpdateProfileRequest req)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return (null, "Tài khoản không tồn tại.");

        if (req.DisplayName is not null) user.DisplayName = req.DisplayName;
        if (req.Bio         is not null) user.Bio         = req.Bio;
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return (new UserDto(user.Id, user.Username, user.Email, user.DisplayName, user.AvatarUrl, user.Role), null);
    }

    // ── Avatar URL (presigned R2 — placeholder until R2 integration) ──────────
    public Task<AvatarUploadUrlResponse> GetAvatarUploadUrlAsync(Guid userId, string filename)
    {
        // TODO: generate real R2 presigned URL in R2 integration milestone
        var key = $"avatars/{userId}/{Guid.NewGuid():N}_{filename}";
        var placeholder = $"/api/users/{userId}/avatar-stub";
        return Task.FromResult(new AvatarUploadUrlResponse(placeholder, placeholder));
    }

    public async Task SetAvatarUrlAsync(Guid userId, string publicUrl)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return;
        user.AvatarUrl = publicUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    public async Task<UserStatsDto> GetStatsAsync(Guid userId) =>
        await BuildStatsAsync(userId);

    // ── Helpers ───────────────────────────────────────────────────────────────
    private async Task<UserStatsDto> BuildStatsAsync(Guid userId)
    {
        var moviesUploaded = await db.Movies.CountAsync(m => m.UploadedById == userId && m.Status == "published");
        var friends        = await db.Friendships.CountAsync(f => f.UserId == userId || f.FriendId == userId);
        var reviews        = await db.Reviews.CountAsync(r => r.UserId == userId);

        return new UserStatsDto(moviesUploaded, friends, reviews);
    }
}
