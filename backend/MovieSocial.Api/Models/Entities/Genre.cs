namespace MovieSocial.Api.Models.Entities;

public class Genre
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;

    public ICollection<MovieGenre> MovieGenres { get; set; } = [];
}
