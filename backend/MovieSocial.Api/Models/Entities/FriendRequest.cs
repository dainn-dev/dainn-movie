namespace MovieSocial.Api.Models.Entities;

public class FriendRequest : BaseEntity
{
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public Guid ReceiverId { get; set; }
    public User Receiver { get; set; } = null!;

    public string Status { get; set; } = "pending"; // pending | accepted | rejected
}
