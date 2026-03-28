namespace MovieSocial.Api.Models.DTOs;

public record RegisterRequest(
    string Username,
    string Email,
    string Password,
    string DisplayName
);

public record LoginRequest(
    string Username,
    string Password
);

public record RefreshRequest(
    string RefreshToken
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    UserDto User
);

/// <summary>Payload JSON cho client — refresh chỉ trong cookie httpOnly (M1a).</summary>
public record AuthTokenResponse(string AccessToken, UserDto User);

public record UserDto(
    Guid Id,
    string Username,
    string Email,
    string DisplayName,
    string? AvatarUrl,
    string Role
);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Token, string NewPassword);
