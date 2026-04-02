namespace MovieSocial.Api.Options;

public class CatalogCacheOptions
{
    public const string SectionName = "CatalogCache";

    /// <summary>Bật cache Redis cho danh mục phim (genres, featured, …).</summary>
    public bool Enabled { get; set; } = true;

    /// <summary>TTL mặc định (giây). Dữ liệu có thể trễ tối đa bằng TTL.</summary>
    public int DefaultSeconds { get; set; } = 120;
}
