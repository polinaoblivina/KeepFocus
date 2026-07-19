using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Interfaces;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Auth.Commands
{
    public sealed record LogoutCommand(string RefreshToken) : IRequest<Result>;

    public sealed class LogoutCommandHandler(IRefreshTokenRepository refreshTokens, IJwtService jwt) : IRequestHandler<LogoutCommand, Result>
    {
        public async Task<Result> Handle(LogoutCommand cmd, CancellationToken ct)
        {
            var hash = jwt.HashRefreshToken(cmd.RefreshToken);
            var existing = await refreshTokens.GetByHashAsync(hash, ct);

            if (existing is not null && existing.RevokedAt is null)
            {
                existing.Revoke();
                await refreshTokens.SaveChangesAsync(ct);
            }

            return Result.Ok;
        }
    }
}
