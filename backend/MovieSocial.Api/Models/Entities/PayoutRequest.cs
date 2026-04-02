namespace MovieSocial.Api.Models.Entities;

public class PayoutRequest : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    /// <summary>Số tiền creator xin rút (VND).</summary>
    public int AmountVnd { get; set; }

    /// <summary>pending | paid | rejected</summary>
    public string Status { get; set; } = "pending";

    public string? AdminNote { get; set; }

    public DateTime? ProcessedAt { get; set; }
}
