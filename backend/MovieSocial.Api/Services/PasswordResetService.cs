using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using MovieSocial.Api.Data;

namespace MovieSocial.Api.Services;

public class PasswordResetService(AppDbContext db, IDistributedCache cache, ILogger<PasswordResetService> logger)
{
    private const int TokenExpiryMinutes = 30;

    // ── Initiate reset ────────────────────────────────────────────────────────
    /// <summary>
    /// Generates a reset token, stores it in Redis, and (stubbed) sends an email.
    /// Always returns true to avoid user enumeration — callers should not reveal
    /// whether the email exists.
    /// </summary>
    public async Task<bool> InitiateAsync(string email)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        if (user is null)
        {
            // silent no-op — don't reveal email existence
            return true;
        }

        var token = GenerateToken();
        await cache.SetStringAsync(
            ResetKey(token),
            user.Id.ToString(),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(TokenExpiryMinutes)
            });

        // TODO: replace stub with real email send (SMTP / Resend / SendGrid)
        // when email infrastructure is configured in a later milestone.
        logger.LogInformation(
            "[PASSWORD RESET STUB] user={UserId} email={Email} token={Token}",
            user.Id, email, token);

        return true;
    }

    // ── Complete reset ────────────────────────────────────────────────────────
    public async Task<(bool success, string? error)> CompleteAsync(string token, string newPassword)
    {
        var key    = ResetKey(token);
        var value  = await cache.GetStringAsync(key);

        if (value is null || !Guid.TryParse(value, out var userId))
            return (false, "Token không hợp lệ hoặc đã hết hạn.");

        var user = await db.Users.FindAsync(userId);
        if (user is null || !user.IsActive)
            return (false, "Tài khoản không tồn tại hoặc đã bị khóa.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt    = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // invalidate token after use
        await cache.RemoveAsync(key);

        return (true, null);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static string GenerateToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(48))
               .Replace("+", "-").Replace("/", "_").TrimEnd('='); // URL-safe

    private static string ResetKey(string token) => $"pwd_reset:{token}";
}
