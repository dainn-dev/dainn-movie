using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class TokenService(IConfiguration config, IDistributedCache cache)
{
    private readonly string _secret     = config["Jwt:Secret"]   ?? throw new InvalidOperationException("Jwt:Secret missing");
    private readonly string _issuer     = config["Jwt:Issuer"]   ?? "MovieSocial";
    private readonly string _audience   = config["Jwt:Audience"] ?? "MovieSocial";
    private readonly int    _accessMins = config.GetValue<int>("Jwt:AccessTokenExpiryMinutes",  15);
    private readonly int    _refreshDays= config.GetValue<int>("Jwt:RefreshTokenExpiryDays",     7);

    // ── Access token ─────────────────────────────────────────────────────────
    public string GenerateAccessToken(User user)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("username",                    user.Username),
            new Claim("role",                        user.Role),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             _issuer,
            audience:           _audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddMinutes(_accessMins),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // ── Refresh token (opaque random bytes stored in Redis) ──────────────────
    public string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public async Task StoreRefreshTokenAsync(Guid userId, string token)
    {
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(_refreshDays),
        };

        var userKey = UserRtKey(userId);
        var oldToken = await cache.GetStringAsync(userKey);
        if (!string.IsNullOrEmpty(oldToken))
            await cache.RemoveAsync(RefreshKey(oldToken));

        await cache.SetStringAsync(RefreshKey(token), userId.ToString(), options);
        await cache.SetStringAsync(userKey, token, options);
    }

    /// <summary>M1a — chỉ refresh token mới nhất (theo user) là hợp lệ; token cũ → session_revoked.</summary>
    public async Task<RefreshTokenValidateResult> ValidateRefreshTokenAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return RefreshTokenValidateResult.Invalid();

        var rtKey = RefreshKey(token);
        var userIdStr = await cache.GetStringAsync(rtKey);
        if (userIdStr is null)
            return RefreshTokenValidateResult.Invalid();

        if (!Guid.TryParse(userIdStr, out var userId))
            return RefreshTokenValidateResult.Invalid();

        var current = await cache.GetStringAsync(UserRtKey(userId));
        if (current != token)
            return RefreshTokenValidateResult.SessionRevoked();

        return RefreshTokenValidateResult.Valid(userId);
    }

    public async Task RevokeRefreshTokenAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return;

        var rtKey = RefreshKey(token);
        var userIdStr = await cache.GetStringAsync(rtKey);
        await cache.RemoveAsync(rtKey);

        if (userIdStr is not null && Guid.TryParse(userIdStr, out var userId))
        {
            var uk = UserRtKey(userId);
            var cur = await cache.GetStringAsync(uk);
            if (cur == token)
                await cache.RemoveAsync(uk);
        }
    }

    // ── Access token blacklist (for logout) ──────────────────────────────────
    public async Task BlacklistAccessTokenAsync(string jti, DateTime expiry)
    {
        var ttl = expiry - DateTime.UtcNow;
        if (ttl <= TimeSpan.Zero) return;

        await cache.SetStringAsync($"bl:jti:{jti}", "1", new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ttl
        });
    }

    public async Task<bool> IsAccessTokenBlacklistedAsync(string jti) =>
        await cache.GetStringAsync($"bl:jti:{jti}") is not null;

    // ── Helpers ──────────────────────────────────────────────────────────────
    public ClaimsPrincipal? ParseAccessToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        try
        {
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey        = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret)),
                ValidateIssuer          = true,
                ValidIssuer             = _issuer,
                ValidateAudience        = true,
                ValidAudience           = _audience,
                ValidateLifetime        = false, // we check expiry manually when needed
            }, out _);
        }
        catch
        {
            return null;
        }
    }

    private static string RefreshKey(string token) => $"rt:{token}";

    private static string UserRtKey(Guid userId) => $"user_rt:{userId}";
}

/// <summary>Kết quả kiểm tra refresh token (M1a — phân biệt hết hạn vs đăng nhập nơi khác).</summary>
public sealed record RefreshTokenValidateResult(bool Ok, Guid? UserId, string? ErrorCode)
{
    public static RefreshTokenValidateResult Valid(Guid userId) => new(true, userId, null);

    public static RefreshTokenValidateResult Invalid() =>
        new(false, null, "invalid_refresh");

    public static RefreshTokenValidateResult SessionRevoked() =>
        new(false, null, "session_revoked");
}
