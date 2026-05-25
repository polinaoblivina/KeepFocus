using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record DeleteCardCommand(Guid UserId, Guid BoardId, Guid ListId, Guid CardId) : IRequest<Result>;
    public sealed class DeleteCardHandler(IBoardRepository boards) : IRequestHandler<DeleteCardCommand, Result>
    {
        public async Task<Result> Handle(DeleteCardCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetWithListsAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.RemoveCard(cmd.ListId, cmd.CardId);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}