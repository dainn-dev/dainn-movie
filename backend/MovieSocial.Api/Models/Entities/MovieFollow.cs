namespace MovieSocial.Api.Models.Entities;

/// <summary>Theo dõi phim để nhận thông báo tập mới (M9).</summary>
public class MovieFollow
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
