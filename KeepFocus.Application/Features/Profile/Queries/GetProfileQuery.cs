using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.Profile.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Profile.Queries
{
    public sealed record GetProfileQuery(Guid UserId) : IRequest<Result<ProfileDto>>;

    public sealed class GetProfileHandler(IUserRepository users) : IRequestHandler<GetProfileQuery, Result<ProfileDto>>
    {
        public async Task<Result<ProfileDto>> Handle(GetProfileQuery q, CancellationToken ct)
        {
            var user = await users.GetByIdAsync(q.UserId, ct);
            if (user is null)
                return Error.NotFound("User not found.");

            return new ProfileDto(user.Id, user.Email.Value, user.Name, user.AvatarUrl, user.CreatedAt);
        }
    }
}
