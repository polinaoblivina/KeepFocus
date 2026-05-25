using KeepFocus.Application.Common;
using KeepFocus.Application.Features.FocusSessions.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.FocusSessions.Queries
{
    public sealed record GetActiveSessionQuery(Guid UserId) : IRequest<Result<SessionDto?>>;
    public sealed class GetActiveSessionHandler(IFocusSessionRepository sessions) : IRequestHandler<GetActiveSessionQuery, Result<SessionDto?>>
    {
        public async Task<Result<SessionDto?>> Handle(GetActiveSessionQuery q, CancellationToken ct)
        {
            var session = await sessions.GetActiveByUserIdAsync(q.UserId, ct);
            return Result<SessionDto?>.FromValue(session is null ? null : SessionMapper.ToDto(session));
        }
    }
}