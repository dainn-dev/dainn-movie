namespace MovieSocial.Api.Models.Entities;

/// <summary>User-submitted moderation reports (M6).</summary>
public class ContentReport : BaseEntity
{
    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    /// <summary>movie | review | user | message</summary>
    public string TargetType { get; set; } = null!;

    public Guid TargetId { get; set; }
    public string Reason { get; set; } = null!;

    /// <summary>pending | dismissed | actioned</summary>
    public string Status { get; set; } = "pending";
}
