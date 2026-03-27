namespace MovieSocial.Api.Models.Entities;

public class Review : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public int Score { get; set; } // 1-10
}
