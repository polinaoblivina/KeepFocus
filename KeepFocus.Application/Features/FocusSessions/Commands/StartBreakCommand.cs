using FluentValidation;
using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.FocusSessions.DTOs;
using KeepFocus.Domain.Enums;
using KeepFocus.Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.FocusSessions.Commands
{
    public sealed record StartBreakCommand(Guid UserId, Guid SessionId, string BreakType, int DurationSeconds) : IRequest<Result<SessionDto>>;
    public sealed class StartBreakCommandValidator : AbstractValidator<StartBreakCommand>
    {
        public StartBreakCommandValidator()
        {
            RuleFor(x => x.BreakType)
                .Must(t => t is "ShortBreak" or "LongBreak" or "Manual")
                .WithMessage("BreakType must be 'ShortBreak', 'LongBreak' or 'Manual'.");

            RuleFor(x => x.DurationSeconds)
                .GreaterThan(0).WithMessage("Duration must be greater than 0.")
                .LessThanOrEqualTo(3600).WithMessage("Break cannot exceed 1 hour.");
        }
    }

    public sealed class StartBreakHandler(IFocusSessionRepository sessions)
        : IRequestHandler<StartBreakCommand, Result<SessionDto>>
    {
        public async Task<Result<SessionDto>> Handle(StartBreakCommand cmd, CancellationToken ct)
        {
            var session = await sessions.GetByIdAsync(cmd.SessionId, ct);

            if (session is null) return Error.NotFound("Session not found.");
            if (session.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            var breakType = Enum.Parse<BreakType>(cmd.BreakType);
            session.StartBreak(breakType, cmd.DurationSeconds);

            await sessions.SaveChangesAsync(ct);
            return SessionMapper.ToDto(session);
        }
    }
}
