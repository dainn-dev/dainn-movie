namespace MovieSocial.Api.Models.DTOs;

// ── Pagination wrapper ────────────────────────────────────────────────────────
public record PagedResult<T>(IEnumerable<T> Data, PaginationMeta Pagination);
public record PaginationMeta(int Page, int PageSize, int Total, int TotalPages);

// ── Genre ─────────────────────────────────────────────────────────────────────
public record GenreDto(int Id, string Name, string Slug);

// ── Movie summary (list) ──────────────────────────────────────────────────────
public record MovieSummaryDto(
    Guid    Id,
    string  Title,
    string  Slug,
    string? PosterUrl,
    int?    ReleaseYear,
    double  AvgRating,
    long    ViewCount,
    IEnumerable<GenreDto> Genres,
    string? Status = null,
    DateTime? CreatedAt = null
);

// ── Movie detail ──────────────────────────────────────────────────────────────
public record MovieDetailDto(
    Guid    Id,
    string  Title,
    string  Slug,
    string? Description,
    string? PosterUrl,
    string? BackdropUrl,
    string? TrailerUrl,
    int?    ReleaseYear,
    int?    RuntimeMinutes,
    string? MpaaRating,
    string  Status,
    long    ViewCount,
    double  AvgRating,
    int     RatingCount,
    IEnumerable<GenreDto>           Genres,
    IEnumerable<CastMemberDto>      Cast,
    IEnumerable<ChapterSummaryDto>  Chapters,
    IEnumerable<MovieSummaryDto>    RelatedMovies
);

// ── Chapters / streaming ─────────────────────────────────────────────────────
public record VideoSourceInfoDto(Guid Id, string Quality, string Status);

public record ChapterSummaryDto(
    Guid    Id,
    string  Title,
    int     Order,
    int?    DurationSeconds,
    string? ThumbnailUrl,
    IEnumerable<VideoSourceInfoDto> VideoSources
);

public record ChapterCreatedDto(Guid Id, string Title, int Order);

public record CreateChapterRequest(string Title, int Order, int? DurationSeconds, string? ThumbnailUrl);

public record UpdateChapterRequest(string? Title, int? Order, int? DurationSeconds, string? ThumbnailUrl);

public record StreamUrlResponse(string Url);

// ── Reviews / ratings ────────────────────────────────────────────────────────
public record ReviewDto(
    Guid    Id,
    Guid    UserId,
    string  Username,
    string? AvatarUrl,
    string  Title,
    string  Body,
    int     Score,
    DateTime CreatedAt
);

public record CreateReviewRequest(string Title, string Body, int Score);

public record UpdateReviewRequest(string? Title, string? Body, int? Score);

public record RateMovieRequest(int Score);

public record MovieRatingResponse(double AvgRating, int RatingCount);

public record CastMemberDto(
    Guid    CelebrityId,
    string  Slug,
    string  Name,
    string? AvatarUrl,
    string  Role,
    string? CharacterName
);

// ── Create / Update movie ─────────────────────────────────────────────────────
public record CreateMovieRequest(
    string  Title,
    string? Description,
    string? PosterUrl,
    string? BackdropUrl,
    string? TrailerUrl,
    int?    ReleaseYear,
    int?    RuntimeMinutes,
    string? MpaaRating,
    IEnumerable<int> GenreIds
);

public record UpdateMovieRequest(
    string?  Title,
    string?  Description,
    string?  PosterUrl,
    string?  BackdropUrl,
    string?  TrailerUrl,
    int?     ReleaseYear,
    int?     RuntimeMinutes,
    string?  MpaaRating,
    string?  Status,
    IEnumerable<int>? GenreIds
);

public record AddMovieCastRequest(
    Guid    CelebrityId,
    string  Role,
    string? CharacterName,
    int     Order
);

// ── Video upload (R2 presigned PUT) ─────────────────────────────────────────
public record VideoPresignRequest(
    Guid   MovieId,
    Guid   ChapterId,
    string Filename,
    string ContentType
);

public record VideoPresignResponse(string Url, string Key, DateTime ExpiresAt);

public record VideoConfirmRequest(
    Guid   MovieId,
    Guid   ChapterId,
    string Key,
    long   FileSizeBytes,
    string ContentType
);

public record VideoConfirmResponse(Guid VideoSourceId);

// ── Celebrity ─────────────────────────────────────────────────────────────────
public record CelebrityListDto(
    Guid    Id,
    string  Name,
    string  Slug,
    string? AvatarUrl,
    string? Country,
    int     MovieCount
);

public record CelebrityDetailDto(
    Guid    Id,
    string  Name,
    string  Slug,
    string? AvatarUrl,
    string? Bio,
    string? Country,
    DateOnly? DateOfBirth,
    IEnumerable<MovieSummaryDto> Movies
);

// ── News ──────────────────────────────────────────────────────────────────────
public record NewsListDto(
    Guid    Id,
    string  Title,
    string  Slug,
    string? CoverUrl,
    string  AuthorName,
    DateTime PublishedAt,
    IEnumerable<string> Tags
);

public record NewsDetailDto(
    Guid    Id,
    string  Title,
    string  Slug,
    string  Content,
    string? CoverUrl,
    string  AuthorName,
    DateTime PublishedAt,
    IEnumerable<string> Tags
);

// ── Trailers (homepage) ─────────────────────────────────────────────────────
public record MovieTrailerDto(
    Guid    Id,
    string  Title,
    string  Slug,
    string? PosterUrl,
    string  TrailerUrl
);

// ── Search ────────────────────────────────────────────────────────────────────
public record SearchResultDto(
    IEnumerable<MovieSummaryDto>  Movies,
    IEnumerable<CelebrityListDto> Celebrities,
    IEnumerable<NewsListDto>      News,
    int Total
);
