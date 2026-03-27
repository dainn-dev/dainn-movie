namespace MovieSocial.Api.Models.Entities;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;

    public ICollection<NewsTag> NewsTags { get; set; } = [];
}
