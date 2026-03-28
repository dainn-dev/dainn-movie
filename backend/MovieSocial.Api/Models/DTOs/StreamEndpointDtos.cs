namespace MovieSocial.Api.Models.DTOs;

public record StreamEndpointDto(Guid Id, int SortOrder, string? R2Key, string? DirectUrl);

public record CreateStreamEndpointRequest(int? SortOrder, string? R2Key, string? DirectUrl);
