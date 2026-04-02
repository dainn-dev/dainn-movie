namespace MovieSocial.Api.Models.Entities;

public class Chapter : BaseEntity
{
    public Guid MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public string Title { get; set; } = null!;
    public int Order { get; set; } = 1;
    public int? DurationSeconds { get; set; }
    public string? ThumbnailUrl { get; set; }

    /// <summary>Thời điểm kết thúc intro (giây từ đầu tập). Null = không bật skip intro.</summary>
    public int? IntroSkipEndSeconds { get; set; }

    /// <summary>R2 object key file phụ đề WebVTT (cùng bucket video).</summary>
    public string? SubtitleR2Key { get; set; }

    public ICollection<VideoSource> VideoSources { get; set; } = [];
    public ICollection<WatchHistory> WatchHistory { get; set; } = [];
}
