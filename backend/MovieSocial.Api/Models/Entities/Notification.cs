namespace MovieSocial.Api.Models.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Type { get; set; } = null!; // friend_request | message | review | system
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public bool IsRead { get; set; } = false;
    public Guid? ReferenceId { get; set; } // optional: related entity id
}
