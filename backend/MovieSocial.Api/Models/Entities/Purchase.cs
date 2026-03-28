namespace MovieSocial.Api.Models.Entities;

public class Purchase : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    /// <summary>Tổng người mua trả (VND).</summary>
    public int AmountVnd { get; set; }

    /// <summary>Hoa hồng nền tảng (VND).</summary>
    public int PlatformFeeVnd { get; set; }

    /// <summary>pending | completed | failed | refunded</summary>
    public string Status { get; set; } = "pending";

    /// <summary>mock | momo | vnpay | zalopay …</summary>
    public string Provider { get; set; } = "mock";

    public string? ExternalId { get; set; }

    public DateTime? CompletedAt { get; set; }
}
