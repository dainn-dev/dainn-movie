using StackExchange.Redis;

namespace MovieSocial.Api.Services;

public class UploadRateLimitService(IConnectionMultiplexer redis, ILogger<UploadRateLimitService> log)
{
    private const int MaxUploadsPerDay = 3;

    public async Task<(bool Allowed, string? Error)> TryConsumeAsync(Guid userId)
    {
        try
        {
            var db = redis.GetDatabase();
            var key = $"upload:daily:{userId:N}:{DateTime.UtcNow:yyyy-MM-dd}";
            var n = await db.StringIncrementAsync(key).ConfigureAwait(false);
            if (n == 1)
                await db.KeyExpireAsync(key, TimeSpan.FromHours(26)).ConfigureAwait(false);

            if (n > MaxUploadsPerDay)
            {
                await db.StringDecrementAsync(key).ConfigureAwait(false);
                return (false, $"Tối đa {MaxUploadsPerDay} lần tải video lên mỗi ngày.");
            }

            return (true, null);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Upload rate limit (Redis) failed");
            return (false, "Hệ thống quota tạm thời không khả dụng.");
        }
    }
}
