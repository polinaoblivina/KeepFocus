using FluentValidation;
using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.FocusSessions.DTOs;
using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.FocusSessions.Commands
{
    public sealed record RecordTabEventCommand(Guid UserId, Guid SessionId, string EventType, int DurationSeconds) : IRequest<Result<SessionDto>>;

    public sealed class RecordTabEventCommandValidator : AbstractValidator<RecordTabEventCommand>
    {
        public RecordTabEventCommandValidator()
        {
            RuleFor(x => x.EventType)
                .Must(t => t is "Hidden" or "Visible")
                .WithMessage("EventType must be 'Hidden' or 'Visible'.");

            RuleFor(x => x.DurationSeconds)
                .GreaterThanOrEqualTo(0);
        }
    }

    public sealed class RecordTabEventHandler(IFocusSessionRepository sessions) : IRequestHandler<RecordTabEventCommand, Result<SessionDto>>
    {
        public async Task<Result<SessionDto>> Handle(RecordTabEventCommand cmd, CancellationToken ct)
        {
            var session = await sessions.GetByIdAsync(cmd.SessionId, ct);

            if (session is null) return Error.NotFound("Session not found.");
            if (session.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            TabEvent? tabEvent = cmd.EventType == "Hidden" ? session.RecordTabHidden(cmd.DurationSeconds) : session.RecordTabVisible(cmd.DurationSeconds);

            if (tabEvent != null)
            {
                await sessions.AddTabEventAsync(tabEvent, ct);
                await sessions.SaveChangesAsync(ct);
            }

            return SessionMapper.ToDto(session);
        }
    }
}