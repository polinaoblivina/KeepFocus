using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.FocusSessions.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.FocusSessions.Commands
{
    public sealed record AbandonSessionCommand(Guid UserId, Guid SessionId) : IRequest<Result<SessionDto>>;
    public sealed class AbandonSessionHandler(IFocusSessionRepository sessions) : IRequestHandler<AbandonSessionCommand, Result<SessionDto>>
    {
        public async Task<Result<SessionDto>> Handle(AbandonSessionCommand cmd, CancellationToken ct)
        {
            var session = await sessions.GetByIdAsync(cmd.SessionId, ct);

            if (session is null) return Error.NotFound("Session not found.");
            if (session.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            session.Abandon();
            await sessions.SaveChangesAsync(ct);
            return SessionMapper.ToDto(session);
        }
    }
}