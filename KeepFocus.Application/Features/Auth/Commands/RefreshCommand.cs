using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Common.Interfaces;
using KeepFocus.Application.Features.Auth.DTOs;
using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Auth.Commands
{
    public sealed record RefreshCommand(string RefreshToken) : IRequest<Result<AuthDto>>;

    public sealed class RefreshCommandHandler(IUserRepository users, IRefreshTokenRepository refreshTokens, IJwtService jwt) : IRequestHandler<RefreshCommand, Result<AuthDto>>
    {
        public async Task<Result<AuthDto>> Handle(RefreshCommand cmd, CancellationToken ct)
        {
            var hash = jwt.HashRefreshToken(cmd.RefreshToken);
            var existing = await refreshTokens.GetByHashAsync(hash, ct);

            if (existing is null || !existing.IsActive)
                return Error.Unauthorized("Invalid or expired refresh token.", "INVALID_REFRESH_TOKEN");

            var user = await users.GetByIdAsync(existing.UserId, ct);
            if (user is null)
                return Error.Unauthorized("Invalid or expired refresh token.", "INVALID_REFRESH_TOKEN");

            existing.Revoke();

            var accessToken = jwt.GenerateAccessToken(user.Id, user.Email.Value);

            var newRefreshToken = jwt.GenerateRefreshToken();
            var newRefreshTokenEntity = RefreshToken.Create(user.Id, jwt.HashRefreshToken(newRefreshToken), DateTime.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(newRefreshTokenEntity, ct);
            await refreshTokens.SaveChangesAsync(ct);

            return new AuthDto(accessToken, user.Id, user.Email.Value, newRefreshToken);
        }
    }
}
