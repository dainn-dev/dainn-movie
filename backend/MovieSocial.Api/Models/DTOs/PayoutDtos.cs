namespace MovieSocial.Api.Models.DTOs;

public record CreatorPayoutBalanceDto(
    long EarnedNetVnd,
    long PaidOutVnd,
    long PendingReserveVnd,
    long AvailableVnd,
    int MinPayoutVnd);

public record PayoutRequestItemDto(
    Guid Id,
    int AmountVnd,
    string Status,
    string? AdminNote,
    DateTime CreatedAt,
    DateTime? ProcessedAt);

public record CreatePayoutRequestBody(int AmountVnd);

public record AdminPayoutRowDto(
    Guid Id,
    Guid UserId,
    string Username,
    int AmountVnd,
    string Status,
    DateTime CreatedAt,
    DateTime? ProcessedAt,
    string? AdminNote);

public record ResolvePayoutRequestBody(bool Paid, string? Note);
