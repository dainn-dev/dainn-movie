namespace MovieSocial.Api.Models.Entities;

public class MovieCast
{
    public Guid MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public Guid CelebrityId { get; set; }
    public Celebrity Celebrity { get; set; } = null!;

    public string Role { get; set; } = null!; // actor | director | writer
    public string? CharacterName { get; set; }
    public int Order { get; set; } = 0;
}
