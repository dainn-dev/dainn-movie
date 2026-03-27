namespace MovieSocial.Api.Models.Entities;

public class News : BaseEntity
{
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? CoverUrl { get; set; }
    public bool IsPublished { get; set; } = false;

    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public ICollection<NewsTag> NewsTags { get; set; } = [];
}
