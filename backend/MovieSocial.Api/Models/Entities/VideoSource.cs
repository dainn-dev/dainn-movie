namespace MovieSocial.Api.Models.Entities;

public class VideoSource : BaseEntity
{
    public Guid ChapterId { get; set; }
    public Chapter Chapter { get; set; } = null!;

    public string Quality { get; set; } = null!; // SD | HD | 4K
    public string R2Key { get; set; } = null!;   // videos/{movieId}/{chapterId}/{quality}.mp4
    public long? FileSizeBytes { get; set; }
    public string Status { get; set; } = "processing"; // processing | ready | failed
}
