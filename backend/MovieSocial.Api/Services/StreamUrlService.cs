using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace MovieSocial.Api.Services;

/// <summary>Presigned GET/PUT và upload/download server-side cho R2 (S3-compatible).</summary>
public class StreamUrlService(IConfiguration cfg, ILogger<StreamUrlService> log, R2AmazonS3Singleton s3Singleton)
{
    private string? ResolveBucket() =>
        cfg["R2:Bucket"] ?? cfg["Cloudflare:R2:BucketName"];

    private string? ResolveAccess() =>
        cfg["R2:AccessKeyId"] ?? cfg["Cloudflare:R2:AccessKeyId"];

    private string? ResolveSecret() =>
        cfg["R2:SecretAccessKey"] ?? cfg["Cloudflare:R2:SecretAccessKey"];

    private string? ResolveAccount() =>
        cfg["R2:AccountId"] ?? cfg["Cloudflare:R2:AccountId"];

    private string? ResolveServiceUrl() =>
        !string.IsNullOrWhiteSpace(ResolveAccount())
            ? $"https://{ResolveAccount()}.r2.cloudflarestorage.com"
            : cfg["R2:ServiceUrl"];

    /// <summary>URL gốc công khai tới bucket (tuỳ chọn) — ghép với object key.</summary>
    public string? ResolvePublicBaseUrl() =>
        (cfg["R2:PublicUrl"] ?? cfg["Cloudflare:R2:PublicUrl"])?.TrimEnd('/');

    public string? GetStreamUrl(string r2Key)
    {
        if (string.IsNullOrWhiteSpace(r2Key)) return null;

        var bucket   = ResolveBucket();
        var access   = ResolveAccess();
        var secret   = ResolveSecret();
        var devUrl   = cfg["Stream:DevPublicVideoUrl"];

        if (string.IsNullOrWhiteSpace(bucket) || string.IsNullOrWhiteSpace(access) || string.IsNullOrWhiteSpace(secret))
        {
            if (!string.IsNullOrWhiteSpace(devUrl))
            {
                log.LogInformation("Stream: issuing dev fallback URL (object key omitted)");
                return devUrl;
            }

            log.LogWarning("Stream: R2 not configured and Stream:DevPublicVideoUrl missing");
            return null;
        }

        var serviceUrl = ResolveServiceUrl();

        if (string.IsNullOrWhiteSpace(serviceUrl))
        {
            log.LogWarning("Stream: R2 ServiceUrl / AccountId missing");
            return null;
        }

        try
        {
            var req = new GetPreSignedUrlRequest
            {
                BucketName = bucket,
                Key        = r2Key,
                Verb       = HttpVerb.GET,
                Expires    = DateTime.UtcNow.AddHours(1),
            };
            string url;
            if (s3Singleton.Client is { } shared)
                url = shared.GetPreSignedURL(req);
            else
            {
                using var ephemeral = CreateClient(serviceUrl, access, secret);
                url = ephemeral.GetPreSignedURL(req);
            }

            log.LogInformation("Stream: presigned URL issued (TTL 1h, key hash {Hash})", r2Key.GetHashCode());
            return url;
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Stream: presign failed");
            return null;
        }
    }

    /// <summary>Presigned PUT for direct browser/mobile uploads to R2.</summary>
    public string? GetPresignedPutUrl(string r2Key, string contentType, TimeSpan ttl)
    {
        if (string.IsNullOrWhiteSpace(r2Key)) return null;

        var bucket  = ResolveBucket();
        var access  = ResolveAccess();
        var secret  = ResolveSecret();

        if (string.IsNullOrWhiteSpace(bucket) || string.IsNullOrWhiteSpace(access) || string.IsNullOrWhiteSpace(secret))
        {
            log.LogWarning("Stream: R2 not configured — cannot issue PUT presign");
            return null;
        }

        var serviceUrl = ResolveServiceUrl();

        if (string.IsNullOrWhiteSpace(serviceUrl))
        {
            log.LogWarning("Stream: R2 ServiceUrl / AccountId missing");
            return null;
        }

        try
        {
            var req = new GetPreSignedUrlRequest
            {
                BucketName  = bucket,
                Key         = r2Key,
                Verb        = HttpVerb.PUT,
                Expires     = DateTime.UtcNow.Add(ttl),
                ContentType = contentType,
            };
            if (s3Singleton.Client is { } shared)
                return shared.GetPreSignedURL(req);
            using var ephemeral = CreateClient(serviceUrl, access, secret);
            return ephemeral.GetPreSignedURL(req);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Stream: PUT presign failed");
            return null;
        }
    }

    public bool IsObjectStorageConfigured()
    {
        var bucket = ResolveBucket();
        var access = ResolveAccess();
        var secret = ResolveSecret();
        return !string.IsNullOrWhiteSpace(bucket) && !string.IsNullOrWhiteSpace(access)
            && !string.IsNullOrWhiteSpace(secret) && !string.IsNullOrWhiteSpace(ResolveServiceUrl());
    }

    public async Task<bool> DownloadObjectToFileAsync(string key, string destinationPath, CancellationToken ct = default)
    {
        if (!IsObjectStorageConfigured() || string.IsNullOrWhiteSpace(key)) return false;
        var bucket = ResolveBucket()!;
        var serviceUrl = ResolveServiceUrl()!;
        var access = ResolveAccess()!;
        var secret = ResolveSecret()!;
        try
        {
            if (s3Singleton.Client is { } shared)
            {
                var resp = await shared.GetObjectAsync(new GetObjectRequest { BucketName = bucket, Key = key }, ct)
                    .ConfigureAwait(false);
                await using var fs = new FileStream(destinationPath, FileMode.Create, FileAccess.Write, FileShare.None);
                await resp.ResponseStream.CopyToAsync(fs, ct).ConfigureAwait(false);
                return true;
            }

            using var ephemeral = CreateClient(serviceUrl, access, secret);
            var respEphemeral = await ephemeral.GetObjectAsync(new GetObjectRequest { BucketName = bucket, Key = key }, ct)
                .ConfigureAwait(false);
            await using var fileStream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write, FileShare.None);
            await respEphemeral.ResponseStream.CopyToAsync(fileStream, ct).ConfigureAwait(false);
            return true;
        }
        catch (Exception ex)
        {
            log.LogError(ex, "R2 download failed for key {Key}", key);
            return false;
        }
    }

    public async Task<bool> UploadFileAsync(string key, string filePath, string contentType, CancellationToken ct = default)
    {
        if (!IsObjectStorageConfigured() || string.IsNullOrWhiteSpace(key)) return false;
        var bucket = ResolveBucket()!;
        var serviceUrl = ResolveServiceUrl()!;
        var access = ResolveAccess()!;
        var secret = ResolveSecret()!;
        try
        {
            await using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            var put = new PutObjectRequest
            {
                BucketName = bucket,
                Key        = key,
                InputStream = fs,
                ContentType = contentType,
            };
            if (s3Singleton.Client is { } shared)
                await shared.PutObjectAsync(put, ct).ConfigureAwait(false);
            else
            {
                using var ephemeral = CreateClient(serviceUrl, access, secret);
                await ephemeral.PutObjectAsync(put, ct).ConfigureAwait(false);
            }

            return true;
        }
        catch (Exception ex)
        {
            log.LogError(ex, "R2 upload failed for key {Key}", key);
            return false;
        }
    }

    private static AmazonS3Client CreateClient(string serviceUrl, string access, string secret)
    {
        var credentials = new BasicAWSCredentials(access, secret);
        var s3config = new AmazonS3Config
        {
            ServiceURL     = serviceUrl,
            ForcePathStyle = true,
            SignatureVersion = "4",
        };
        return new AmazonS3Client(credentials, s3config);
    }
}
