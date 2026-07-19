namespace KeepFocus.Application.Features.Auth.DTOs
{
    public sealed record AuthDto(string Token, Guid UserId, string Email, string RefreshToken);
}
