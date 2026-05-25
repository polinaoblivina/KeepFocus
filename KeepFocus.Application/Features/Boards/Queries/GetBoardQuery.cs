using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Queries
{
    public sealed record GetBoardQuery(Guid UserId, Guid BoardId) : IRequest<Result<BoardDto>>;
    public sealed class GetBoardHandler(IBoardRepository boards) : IRequestHandler<GetBoardQuery, Result<BoardDto>>
    {
        public async Task<Result<BoardDto>> Handle(GetBoardQuery q, CancellationToken ct)
        {
            var board = await boards.GetFullAsync(q.BoardId, ct);

            if (board is null)
                return Error.NotFound("Board not found.");

            if (board.UserId != q.UserId)
                return Error.Forbidden("You don't have access to this board.");

            return BoardMapper.ToFull(board);
        }
    }
}