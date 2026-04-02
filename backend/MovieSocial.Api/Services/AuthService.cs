using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class AuthService(AppDbContext db, TokenService tokens)
{
    // ── Register ─────────────────────────────────────────────────────────────
    public async Task<(UserDto? user, string? error)> RegisterAsync(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Username == req.Username))
            return (null, "Username đã được sử dụng.");

        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return (null, "Email đã được sử dụng.");

        var user = new User
        {
            Username     = req.Username,
            Email        = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            DisplayName  = req.DisplayName,
            Role         = "user",
            IsActive     = true,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return (MapUserDto(user), null);
    }

    // ── Login ────────────────────────────────────────────────────────────────
    public async Task<(AuthResponse? response, string? error)> LoginAsync(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return (null, "Tên đăng nhập hoặc mật khẩu không đúng.");

        if (!user.IsActive)
            return (null, "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.");

        return (await BuildAuthResponseAsync(user), null);
    }

    // ── Logout ───────────────────────────────────────────────────────────────
    public async Task LogoutAsync(string refreshToken, string? accessToken)
    {
        await tokens.RevokeRefreshTokenAsync(refreshToken);

        // Blacklist the current access token so it can't be reused until it expires
        if (accessToken is not null)
        {
            var principal = tokens.ParseAccessToken(accessToken);
            var jti = principal?.FindFirst("jti")?.Value
                   ?? principal?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti)?.Value;

            if (jti is not null)
            {
                var expClaim = principal?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Exp)?.Value;
                var expiry = expClaim is not null
                    ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(expClaim)).UtcDateTime
                    : DateTime.UtcNow.AddMinutes(15);

                await tokens.BlacklistAccessTokenAsync(jti, expiry);
            }
        }
    }

    // ── Refresh ──────────────────────────────────────────────────────────────
    public async Task<(AuthResponse? response, string? error, string? errorCode)> RefreshAsync(string refreshToken)
    {
        var v = await tokens.ValidateRefreshTokenAsync(refreshToken);
        if (!v.Ok)
        {
            var msg = v.ErrorCode == "session_revoked"
                ? "Phiên đã kết thúc — tài khoản đăng nhập nơi khác."
                : "Refresh token không hợp lệ hoặc đã hết hạn.";
            return (null, msg, v.ErrorCode);
        }

        var user = await db.Users.FindAsync(v.UserId!.Value);
        if (user is null || !user.IsActive)
            return (null, "Tài khoản không tồn tại hoặc đã bị khóa.", "invalid_refresh");

        await tokens.RevokeRefreshTokenAsync(refreshToken);
        return (await BuildAuthResponseAsync(user), null, null);
    }

    // ── Me ───────────────────────────────────────────────────────────────────
    public async Task<UserDto?> GetMeAsync(Guid userId)
    {
        var user = await db.Users.FindAsync(userId);
        return user is null ? null : MapUserDto(user);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private async Task<AuthResponse> BuildAuthResponseAsync(User user)
    {
        var accessToken  = tokens.GenerateAccessToken(user);
        var refreshToken = tokens.GenerateRefreshToken();
        await tokens.StoreRefreshTokenAsync(user.Id, refreshToken);
        return new AuthResponse(accessToken, refreshToken, MapUserDto(user));
    }

    private static UserDto MapUserDto(User u) =>
        new(u.Id, u.Username, u.Email, u.DisplayName, u.AvatarUrl, u.Role);
}
