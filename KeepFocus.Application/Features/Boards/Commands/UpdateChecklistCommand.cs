using FluentValidation;
using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record UpdateChecklistCommand(Guid UserId, Guid BoardId, Guid CardId, Guid ChecklistId, string Title) : IRequest<Result>;
    public sealed class UpdateChecklistCommandValidator : AbstractValidator<UpdateChecklistCommand>
    {
        public UpdateChecklistCommandValidator() =>
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
    }
    public sealed class UpdateChecklistHandler(IBoardRepository boards) : IRequestHandler<UpdateChecklistCommand, Result>
    {
        public async Task<Result> Handle(UpdateChecklistCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetFullAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.UpdateChecklistTitle(cmd.CardId, cmd.ChecklistId, cmd.Title);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}
