namespace MovieSocial.Api.Models.Entities;

public class NewsTag
{
    public Guid NewsId { get; set; }
    public News News { get; set; } = null!;

    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
