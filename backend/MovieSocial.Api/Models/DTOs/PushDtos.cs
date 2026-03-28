namespace MovieSocial.Api.Models.DTOs;

public record PushSubscriptionKeysDto(string P256dh, string Auth);

public record SavePushSubscriptionRequest(string Endpoint, PushSubscriptionKeysDto Keys);

public record UnsubscribePushRequest(string? Endpoint);
