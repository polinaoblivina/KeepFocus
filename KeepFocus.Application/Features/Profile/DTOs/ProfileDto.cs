namespace KeepFocus.Application.Features.Profile.DTOs
{
    public sealed record ProfileDto(Guid UserId, string Email, string? Name, string? AvatarUrl, DateTime CreatedAt);
}
