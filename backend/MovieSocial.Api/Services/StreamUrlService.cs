using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace MovieSocial.Api.Services;

/// <summary>Presigned GET for R2 (S3-compatible). Falls back to a public dev URL when R2 is not configured.</summary>
public class StreamUrlService(IConfiguration cfg, ILogger<StreamUrlService> log)
{
    public string? GetStreamUrl(string r2Key)
    {
        if (string.IsNullOrWhiteSpace(r2Key)) return null;

        var bucket   = cfg["R2:Bucket"];
        var access   = cfg["R2:AccessKeyId"];
        var secret   = cfg["R2:SecretAccessKey"];
        var account  = cfg["R2:AccountId"];
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

        var serviceUrl = !string.IsNullOrWhiteSpace(account)
            ? $"https://{account}.r2.cloudflarestorage.com"
            : cfg["R2:ServiceUrl"];

        if (string.IsNullOrWhiteSpace(serviceUrl))
        {
            log.LogWarning("Stream: R2 ServiceUrl / AccountId missing");
            return null;
        }

        try
        {
            var credentials = new BasicAWSCredentials(access, secret);
            var config = new AmazonS3Config
            {
                ServiceURL = serviceUrl,
                ForcePathStyle = true,
                SignatureVersion = "4",
            };
            using var client = new AmazonS3Client(credentials, config);
            var req = new GetPreSignedUrlRequest
            {
                BucketName = bucket,
                Key        = r2Key,
                Verb       = HttpVerb.GET,
                Expires    = DateTime.UtcNow.AddHours(1),
            };
            var url = client.GetPreSignedURL(req);
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

        var bucket  = cfg["R2:Bucket"];
        var access  = cfg["R2:AccessKeyId"];
        var secret  = cfg["R2:SecretAccessKey"];
        var account = cfg["R2:AccountId"];

        if (string.IsNullOrWhiteSpace(bucket) || string.IsNullOrWhiteSpace(access) || string.IsNullOrWhiteSpace(secret))
        {
            log.LogWarning("Stream: R2 not configured — cannot issue PUT presign");
            return null;
        }

        var serviceUrl = !string.IsNullOrWhiteSpace(account)
            ? $"https://{account}.r2.cloudflarestorage.com"
            : cfg["R2:ServiceUrl"];

        if (string.IsNullOrWhiteSpace(serviceUrl))
        {
            log.LogWarning("Stream: R2 ServiceUrl / AccountId missing");
            return null;
        }

        try
        {
            var credentials = new BasicAWSCredentials(access, secret);
            var s3config = new AmazonS3Config
            {
                ServiceURL = serviceUrl,
                ForcePathStyle = true,
                SignatureVersion = "4",
            };
            using var client = new AmazonS3Client(credentials, s3config);
            var req = new GetPreSignedUrlRequest
            {
                BucketName  = bucket,
                Key         = r2Key,
                Verb        = HttpVerb.PUT,
                Expires     = DateTime.UtcNow.Add(ttl),
                ContentType = contentType,
            };
            return client.GetPreSignedURL(req);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Stream: PUT presign failed");
            return null;
        }
    }
}
