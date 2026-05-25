using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.FocusSessions.DTOs;
using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Enums;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.FocusSessions.Commands
{
   public sealed record StartSessionCommand(Guid UserId, string Mode, string Type, int? CustomDurationSeconds, Guid? CardId) : IRequest<Result<SessionDto>>;
    public sealed class StartSessionCommandValidator : AbstractValidator<StartSessionCommand>
    {
        public StartSessionCommandValidator()
        {
            RuleFor(x => x.Mode)
                .Must(m => m is "Soft" or "Hard")
                .WithMessage("Mode must be 'Soft' or 'Hard'.");

            RuleFor(x => x.Type)
                .Must(t => t is "Pomodoro" or "Custom")
                .WithMessage("Type must be 'Pomodoro' or 'Custom'.");

            RuleFor(x => x.CustomDurationSeconds)
                .NotNull().WithMessage("CustomDurationSeconds is required for Custom type.")
                .InclusiveBetween(60, 86400).WithMessage("Duration must be between 60s and 24h.")
                .When(x => x.Type == "Custom");
        }
    }

    public sealed class StartSessionHandler(IFocusSessionRepository sessions) : IRequestHandler<StartSessionCommand, Result<SessionDto>>
    {
        public async Task<Result<SessionDto>> Handle(StartSessionCommand cmd, CancellationToken ct)
        {
            var existing = await sessions.GetActiveByUserIdAsync(cmd.UserId, ct);
            if (existing is not null)
                return Error.Conflict( "You already have an active session. Complete or abandon it first.", "SESSION_ALREADY_ACTIVE");

            var mode = Enum.Parse<FocusMode>(cmd.Mode);

            var session = cmd.Type == "Pomodoro"
                ? FocusSession.StartPomodoro(cmd.UserId, mode, cmd.CardId)
                : FocusSession.StartCustom(cmd.UserId, mode, cmd.CustomDurationSeconds!.Value, cmd.CardId);

            await sessions.AddAsync(session, ct);
            await sessions.SaveChangesAsync(ct);
            return SessionMapper.ToDto(session);
        }
    }
}