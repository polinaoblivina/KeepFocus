using KeepFocus.Application.Common;
using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Queries
{
    public sealed record GetBoardsQuery(Guid UserId) : IRequest<Result<IReadOnlyList<BoardSummaryDto>>>;
    public sealed class GetBoardsHandler(IBoardRepository boards) : IRequestHandler<GetBoardsQuery, Result<IReadOnlyList<BoardSummaryDto>>>
    {
        public async Task<Result<IReadOnlyList<BoardSummaryDto>>> Handle(GetBoardsQuery q, CancellationToken ct)
        {
            var result = await boards.GetByUserIdAsync(q.UserId, ct);
            return Result<IReadOnlyList<BoardSummaryDto>>.FromValue(result.Select(BoardMapper.ToSummary).ToList().AsReadOnly());
        }
    }
}