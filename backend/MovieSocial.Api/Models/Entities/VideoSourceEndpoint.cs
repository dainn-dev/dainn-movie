namespace MovieSocial.Api.Models.Entities;

/// <summary>
/// Điểm phát thay thế cho một <see cref="VideoSource"/> (CDN mirror, key R2 khác, hoặc URL tuyệt đối).
/// Thứ tự ưu tiên: <see cref="SortOrder"/> tăng dần; mục đầu tiên hợp lệ được dùng khi phát.
/// </summary>
public class VideoSourceEndpoint : BaseEntity
{
    public Guid VideoSourceId { get; set; }
    public VideoSource VideoSource { get; set; } = null!;

    /// <summary>Thứ tự thử (nhỏ trước).</summary>
    public int SortOrder { get; set; }

    /// <summary>Object key trên R2 (presign giống VideoSource gốc).</summary>
    public string? R2Key { get; set; }

    /// <summary>URL phát trực tiếp (CDN công khai, signed URL dài hạn, v.v.).</summary>
    public string? DirectUrl { get; set; }
}
