namespace MovieSocial.Api.Models.Entities;

public class Chapter : BaseEntity
{
    public Guid MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public string Title { get; set; } = null!;
    public int Order { get; set; } = 1;
    public int? DurationSeconds { get; set; }
    public string? ThumbnailUrl { get; set; }

    public ICollection<VideoSource> VideoSources { get; set; } = [];
    public ICollection<WatchHistory> WatchHistory { get; set; } = [];
}
