using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record DeleteListCommand(Guid UserId, Guid BoardId, Guid ListId) : IRequest<Result>;

    public sealed class DeleteListHandler(IBoardRepository boards) : IRequestHandler<DeleteListCommand, Result>
    {
        public async Task<Result> Handle(DeleteListCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetWithListsAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.RemoveList(cmd.ListId);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}