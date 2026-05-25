using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.FocusSessions.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.FocusSessions.Commands
{
    public sealed record ResumeSessionCommand(Guid UserId, Guid SessionId) : IRequest<Result<SessionDto>>;
    public sealed class ResumeSessionHandler(IFocusSessionRepository sessions) : IRequestHandler<ResumeSessionCommand, Result<SessionDto>>
    {
        public async Task<Result<SessionDto>> Handle(ResumeSessionCommand cmd, CancellationToken ct)
        {
            var session = await sessions.GetByIdAsync(cmd.SessionId, ct);

            if (session is null) return Error.NotFound("Session not found.");
            if (session.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            session.Resume();
            await sessions.SaveChangesAsync(ct);
            return SessionMapper.ToDto(session);
        }
    }
}