using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Common.Interfaces;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Profile.Commands
{
    public sealed record DeleteAvatarCommand(Guid UserId) : IRequest<Result>;

    public sealed class DeleteAvatarCommandHandler(IUserRepository users, IAvatarStorage storage) : IRequestHandler<DeleteAvatarCommand, Result>
    {
        public async Task<Result> Handle(DeleteAvatarCommand cmd, CancellationToken ct)
        {
            var user = await users.GetByIdAsync(cmd.UserId, ct);
            if (user is null)
                return Error.NotFound("User not found.");

            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                storage.Delete(user.AvatarUrl);
                user.UpdateAvatar(null);
                await users.SaveChangesAsync(ct);
            }

            return Result.Ok;
        }
    }
}
