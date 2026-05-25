using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record RemoveChecklistCommand(Guid UserId, Guid BoardId, Guid CardId, Guid ChecklistId) : IRequest<Result>;
    public sealed class RemoveChecklistHandler(IBoardRepository boards) : IRequestHandler<RemoveChecklistCommand, Result>
    {
        public async Task<Result> Handle(RemoveChecklistCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetFullAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.RemoveChecklist(cmd.CardId, cmd.ChecklistId);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}
