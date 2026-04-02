namespace MovieSocial.Api.Models.DTOs;

public record FriendUserDto(Guid Id, string Username, string DisplayName, string? AvatarUrl);

public record FriendRequestDto(
    Guid Id,
    Guid SenderId,
    string SenderUsername,
    string SenderDisplayName,
    string? SenderAvatarUrl,
    Guid ReceiverId,
    string ReceiverUsername,
    string Status,
    DateTime CreatedAt);

public record SendFriendRequestRequest(string ReceiverUsername);

public record MessageDto(
    Guid Id,
    Guid SenderId,
    Guid ReceiverId,
    string Body,
    DateTime CreatedAt,
    bool IsRead);

public record SendMessageRequest(Guid ReceiverId, string Body);

public record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string Body,
    bool IsRead,
    DateTime CreatedAt,
    Guid? ReferenceId,
    Guid? ReferenceMovieId);

public record WatchHistoryItemDto(
    Guid Id,
    Guid MovieId,
    string MovieTitle,
    string? PosterUrl,
    Guid ChapterId,
    string ChapterTitle,
    int ProgressSeconds,
    DateTime WatchedAt);

public record RecordWatchHistoryRequest(Guid MovieId, Guid ChapterId, int ProgressSeconds);

/// <summary>Tiến độ xem gần nhất cho một tập (0 nếu chưa có).</summary>
public record WatchProgressDto(int ProgressSeconds);

public record SubmitReportRequest(string TargetType, Guid TargetId, string Reason);

public record UserSearchResultDto(Guid Id, string Username, string DisplayName, string? AvatarUrl);
