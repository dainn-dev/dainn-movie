namespace MovieSocial.Api.Models.Entities;

public class Celebrity : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Country { get; set; }

    public ICollection<MovieCast> MovieCast { get; set; } = [];
}
