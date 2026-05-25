using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record MoveCardCommand(Guid UserId, Guid BoardId, Guid CardId, Guid TargetListId, int Position) : IRequest<Result>;
    public sealed class MoveCardHandler(IBoardRepository boards) : IRequestHandler<MoveCardCommand, Result>
    {
        public async Task<Result> Handle(MoveCardCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetWithListsAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.MoveCard(cmd.CardId, cmd.TargetListId, cmd.Position);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}