using KeepFocus.Application.Common;
using KeepFocus.Application.Features.FocusSessions.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.FocusSessions.Queries
{
    public sealed record GetSessionHistoryQuery(Guid UserId, DateTime? From, DateTime? To) : IRequest<Result<IReadOnlyList<SessionDto>>>;
    public sealed class GetSessionHistoryHandler(IFocusSessionRepository sessions) : IRequestHandler<GetSessionHistoryQuery, Result<IReadOnlyList<SessionDto>>>
    {
        public async Task<Result<IReadOnlyList<SessionDto>>> Handle(GetSessionHistoryQuery q, CancellationToken ct)
        {
            var result = await sessions.GetByUserIdAsync(q.UserId, q.From, q.To, ct);
            return Result<IReadOnlyList<SessionDto>>.FromValue(result.Select(SessionMapper.ToDto).ToList().AsReadOnly());
        }
    }
}