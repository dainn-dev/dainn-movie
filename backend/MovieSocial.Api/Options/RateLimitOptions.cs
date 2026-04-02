namespace MovieSocial.Api.Options;

public class RateLimitOptions
{
    public const string SectionName = "RateLimit";

    /// <summary>Số request tối đa mỗi cửa sổ (mặc định 400/phút theo M7).</summary>
    public int PermitLimit { get; set; } = 400;

    /// <summary>Độ dài cửa sổ (phút).</summary>
    public int WindowMinutes { get; set; } = 1;
}
