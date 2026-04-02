namespace MovieSocial.Api.Models.DTOs;

public record CheckoutRequest(Guid MovieId);

public record CheckoutResponseDto(
    Guid PurchaseId,
    string Status,
    int AmountVnd,
    int PlatformFeeVnd,
    int NetToCreatorVnd,
    bool MockCheckoutEnabled,
    string? Message);

public record PurchaseListItemDto(
    Guid Id,
    Guid MovieId,
    string MovieTitle,
    string? MoviePosterUrl,
    int AmountVnd,
    string Status,
    DateTime CreatedAt,
    DateTime? CompletedAt);

public record PurchaseDetailDto(
    Guid Id,
    Guid MovieId,
    string MovieTitle,
    string? MoviePosterUrl,
    int AmountVnd,
    int PlatformFeeVnd,
    int NetToCreatorVnd,
    string Status,
    string Provider,
    string? ExternalId,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    /// <summary>buyer | seller — người gọi API là ai so với đơn.</summary>
    string ViewerRole);

public record CreatorSaleRowDto(
    Guid PurchaseId,
    Guid MovieId,
    string MovieTitle,
    string BuyerUsername,
    int AmountVnd,
    int PlatformFeeVnd,
    int NetToCreatorVnd,
    string Status,
    DateTime CreatedAt,
    DateTime? CompletedAt);

public record CreatorSalesSummaryDto(
    int CompletedSalesCount,
    int PendingPurchasesCount,
    long TotalGrossVnd,
    long TotalPlatformFeesVnd,
    long TotalNetToCreatorVnd);

public record CreatorSalesResponseDto(
    CreatorSalesSummaryDto Summary,
    IReadOnlyList<CreatorSaleRowDto> Items);

public record WebhookPaymentNotifyDto(
    Guid PurchaseId,
    string? ExternalTransactionId,
    bool Paid);

public record AdminPurchaseRowDto(
    Guid Id,
    Guid UserId,
    string BuyerUsername,
    Guid MovieId,
    string MovieTitle,
    int AmountVnd,
    int PlatformFeeVnd,
    string Status,
    string Provider,
    DateTime CreatedAt,
    DateTime? CompletedAt);
