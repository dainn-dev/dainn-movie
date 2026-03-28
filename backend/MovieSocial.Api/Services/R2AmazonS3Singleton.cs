using Amazon.Runtime;
using Amazon.S3;

namespace MovieSocial.Api.Services;

/// <summary>M10-T5: một AmazonS3Client cho presign R2 (thread-safe), tránh tạo mới mỗi request.</summary>
public sealed class R2AmazonS3Singleton(IConfiguration cfg, ILogger<R2AmazonS3Singleton> log)
{
    private readonly Lazy<AmazonS3Client?> _client = new(() => TryCreate(cfg, log));

    public AmazonS3Client? Client => _client.Value;

    private static AmazonS3Client? TryCreate(IConfiguration cfg, ILogger log)
    {
        var bucket = cfg["R2:Bucket"] ?? cfg["Cloudflare:R2:BucketName"];
        var access = cfg["R2:AccessKeyId"] ?? cfg["Cloudflare:R2:AccessKeyId"];
        var secret = cfg["R2:SecretAccessKey"] ?? cfg["Cloudflare:R2:SecretAccessKey"];
        var account = cfg["R2:AccountId"] ?? cfg["Cloudflare:R2:AccountId"];
        var serviceUrl = !string.IsNullOrWhiteSpace(account)
            ? $"https://{account}.r2.cloudflarestorage.com"
            : cfg["R2:ServiceUrl"];

        if (string.IsNullOrWhiteSpace(bucket) || string.IsNullOrWhiteSpace(access)
            || string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(serviceUrl))
            return null;

        try
        {
            var credentials = new BasicAWSCredentials(access, secret);
            var s3config = new AmazonS3Config
            {
                ServiceURL = serviceUrl,
                ForcePathStyle = true,
                SignatureVersion = "4",
            };
            return new AmazonS3Client(credentials, s3config);
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "R2: could not construct AmazonS3Client singleton");
            return null;
        }
    }
}
