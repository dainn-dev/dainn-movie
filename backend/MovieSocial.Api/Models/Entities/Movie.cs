namespace MovieSocial.Api.Models.Entities;

public class Movie : BaseEntity
{
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Description { get; set; }
    public string? PosterUrl { get; set; }
    public string? BackdropUrl { get; set; }
    public string? TrailerUrl { get; set; }
    public int? ReleaseYear { get; set; }
    public int? RuntimeMinutes { get; set; }
    public string? MpaaRating { get; set; } // G, PG, PG-13, R, NC-17
    public string Status { get; set; } = "draft"; // draft | processing | published | rejected
    public long ViewCount { get; set; } = 0;

    public Guid UploadedById { get; set; }
    public User UploadedBy { get; set; } = null!;

    // Navigation
    public ICollection<MovieGenre> MovieGenres { get; set; } = [];
    public ICollection<MovieCast> Cast { get; set; } = [];
    public ICollection<Chapter> Chapters { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<Rating> Ratings { get; set; } = [];
    public ICollection<Favorite> Favorites { get; set; } = [];
    public ICollection<Watchlist> Watchlist { get; set; } = [];
    public ICollection<WatchHistory> WatchHistory { get; set; } = [];
}
