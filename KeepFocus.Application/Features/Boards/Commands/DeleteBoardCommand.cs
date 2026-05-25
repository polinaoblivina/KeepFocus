using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record DeleteBoardCommand(Guid UserId, Guid BoardId) : IRequest<Result>;
    public sealed class DeleteBoardHandler(IBoardRepository boards) : IRequestHandler<DeleteBoardCommand, Result>
    {
        public async Task<Result> Handle(DeleteBoardCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetByIdAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            await boards.RemoveAsync(cmd.BoardId, ct);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}