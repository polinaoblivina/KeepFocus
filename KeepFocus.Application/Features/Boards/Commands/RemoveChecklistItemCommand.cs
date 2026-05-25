using KeepFocus.Application.Common;
using KeepFocus.Domain.Interfaces;
using MediatR;
using KeepFocus.Application.Common.Errors;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record RemoveChecklistItemCommand(Guid UserId, Guid BoardId, Guid CardId, Guid ChecklistId, Guid ItemId) : IRequest<Result>;
    public sealed class RemoveChecklistItemHandler(IBoardRepository boards) : IRequestHandler<RemoveChecklistItemCommand, Result>
    {
        public async Task<Result> Handle(RemoveChecklistItemCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetFullAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.RemoveChecklistItem(cmd.CardId, cmd.ChecklistId, cmd.ItemId);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}
