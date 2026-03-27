namespace MovieSocial.Api.Models.Entities;

public class Favorite
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
