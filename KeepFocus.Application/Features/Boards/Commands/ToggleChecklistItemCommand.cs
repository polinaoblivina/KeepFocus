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
    public sealed record ToggleChecklistItemCommand(Guid UserId, Guid BoardId, Guid CardId, Guid ChecklistId, Guid ItemId) : IRequest<Result>;
    public sealed class ToggleChecklistItemHandler(IBoardRepository boards) : IRequestHandler<ToggleChecklistItemCommand, Result>
    {
        public async Task<Result> Handle(ToggleChecklistItemCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetFullAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.ToggleChecklistItem(cmd.CardId, cmd.ChecklistId, cmd.ItemId);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}
