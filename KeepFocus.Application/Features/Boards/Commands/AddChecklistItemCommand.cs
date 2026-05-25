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
    public sealed record AddChecklistItemCommand(Guid UserId, Guid BoardId, Guid CardId, Guid ChecklistId, string Content) : IRequest<Result<ChecklistItemDto>>;
    public sealed class AddChecklistItemCommandValidator : AbstractValidator<AddChecklistItemCommand>
    {
        public AddChecklistItemCommandValidator() => RuleFor(x => x.Content).NotEmpty().MaximumLength(500);
    }
    public sealed class AddChecklistItemHandler(IBoardRepository boards) : IRequestHandler<AddChecklistItemCommand, Result<ChecklistItemDto>>
    {
        public async Task<Result<ChecklistItemDto>> Handle(AddChecklistItemCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetFullAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            var item = board.AddChecklistItem(cmd.CardId, cmd.ChecklistId, cmd.Content);
            await boards.SaveChangesAsync(ct);

            return new ChecklistItemDto(item.Id, item.Content, item.IsChecked, item.Position);
        }
    }
}
