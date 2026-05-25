using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.FocusSessions.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.FocusSessions.Commands
{
    public sealed record PauseSessionCommand(Guid UserId, Guid SessionId) : IRequest<Result<SessionDto>>;
    public sealed class PauseSessionHandler(IFocusSessionRepository sessions) : IRequestHandler<PauseSessionCommand, Result<SessionDto>>
    {
        public async Task<Result<SessionDto>> Handle(PauseSessionCommand cmd, CancellationToken ct)
        {
            var session = await sessions.GetByIdAsync(cmd.SessionId, ct);

            if (session is null) return Error.NotFound("Session not found.");
            if (session.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            session.Pause();
            await sessions.SaveChangesAsync(ct);
            return SessionMapper.ToDto(session);
        }
    }
}