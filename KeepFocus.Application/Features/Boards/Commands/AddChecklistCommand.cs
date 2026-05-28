using FluentValidation;
using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record AddChecklistCommand(Guid UserId, Guid BoardId, Guid CardId, string Title) : IRequest<Result<ChecklistDto>>;
    public sealed class AddChecklistCommandValidator : AbstractValidator<AddChecklistCommand>
    {
        public AddChecklistCommandValidator() =>
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
    }

    public sealed class AddChecklistHandler(IBoardRepository boards) : IRequestHandler<AddChecklistCommand, Result<ChecklistDto>>
    {
        public async Task<Result<ChecklistDto>> Handle(AddChecklistCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetFullAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            var checklist = board.AddChecklist(cmd.CardId, cmd.Title);
            await boards.AddChecklistAsync(checklist, ct); 
            await boards.SaveChangesAsync(ct);

            return new ChecklistDto(checklist.Id, checklist.Title, 0, 0, []);
        }
    }
}
