namespace MovieSocial.Api.Models.Entities;

public class WatchHistory : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public Guid ChapterId { get; set; }
    public Chapter Chapter { get; set; } = null!;

    public int ProgressSeconds { get; set; } = 0;
    public DateTime WatchedAt { get; set; } = DateTime.UtcNow;
}
