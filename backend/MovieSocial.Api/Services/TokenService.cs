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
        var key = RefreshKey(token);
        await cache.SetStringAsync(key, userId.ToString(), new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(_refreshDays)
        });
    }

    public async Task<Guid?> ValidateRefreshTokenAsync(string token)
    {
        var key   = RefreshKey(token);
        var value = await cache.GetStringAsync(key);
        return value is null ? null : Guid.Parse(value);
    }

    public async Task RevokeRefreshTokenAsync(string token) =>
        await cache.RemoveAsync(RefreshKey(token));

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
}
