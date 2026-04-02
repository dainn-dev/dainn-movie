using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using MovieSocial.Api.Options;

namespace MovieSocial.Api.Services;

/// <summary>
/// Cache đọc catalog (JSON qua IDistributedCache / Redis). Lỗi Redis → miss, gọi DB bình thường.
/// </summary>
public class CatalogReadCache(
    IDistributedCache cache,
    IOptions<CatalogCacheOptions> options,
    ILogger<CatalogReadCache> log)
{
    private readonly CatalogCacheOptions _opt = options.Value;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default) where T : class
    {
        if (!_opt.Enabled) return null;
        try
        {
            var bytes = await cache.GetAsync(key, ct).ConfigureAwait(false);
            if (bytes is null || bytes.Length == 0) return null;
            return JsonSerializer.Deserialize<T>(bytes, JsonOpts);
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Catalog cache GET miss for {Key}", key);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T value, CancellationToken ct = default)
    {
        if (!_opt.Enabled) return;
        try
        {
            var bytes = JsonSerializer.SerializeToUtf8Bytes(value, JsonOpts);
            await cache.SetAsync(
                key,
                bytes,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(
                        Math.Clamp(_opt.DefaultSeconds, 5, 3_600)),
                },
                ct).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Catalog cache SET failed for {Key}", key);
        }
    }
}
