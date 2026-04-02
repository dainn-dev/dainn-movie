namespace MovieSocial.Api.Models.Entities;

/// <summary>Web Push subscription per browser/device (M9-T10).</summary>
public class PushSubscription : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    /// <summary>Push service URL — unique across all clients.</summary>
    public string Endpoint { get; set; } = null!;

    public string P256dh { get; set; } = null!;
    public string Auth { get; set; } = null!;
}
