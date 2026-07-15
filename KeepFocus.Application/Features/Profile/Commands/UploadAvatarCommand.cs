using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Common.Interfaces;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Profile.Commands
{
    public sealed record UploadAvatarCommand(Guid UserId, Stream Content, string Extension) : IRequest<Result<string>>;

    public sealed class UploadAvatarCommandHandler(IUserRepository users, IAvatarStorage storage) : IRequestHandler<UploadAvatarCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(UploadAvatarCommand cmd, CancellationToken ct)
        {
            var user = await users.GetByIdAsync(cmd.UserId, ct);
            if (user is null)
                return Error.NotFound("User not found.");

            var newUrl = await storage.SaveAsync(cmd.Content, cmd.Extension, ct);

            if (!string.IsNullOrEmpty(user.AvatarUrl))
                storage.Delete(user.AvatarUrl);

            user.UpdateAvatar(newUrl);
            await users.SaveChangesAsync(ct);

            return newUrl;
        }
    }
}
