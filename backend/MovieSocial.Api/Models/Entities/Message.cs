namespace MovieSocial.Api.Models.Entities;

public class Message : BaseEntity
{
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public Guid ReceiverId { get; set; }
    public User Receiver { get; set; } = null!;

    public string Body { get; set; } = null!;
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
}
