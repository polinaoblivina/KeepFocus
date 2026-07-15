using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.Profile.DTOs;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.Profile.Commands
{
    public sealed record UpdateProfileCommand(Guid UserId, string Name) : IRequest<Result<ProfileDto>>;

    public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
    {
        public UpdateProfileCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");
        }
    }

    public sealed class UpdateProfileCommandHandler(IUserRepository users) : IRequestHandler<UpdateProfileCommand, Result<ProfileDto>>
    {
        public async Task<Result<ProfileDto>> Handle(UpdateProfileCommand cmd, CancellationToken ct)
        {
            var user = await users.GetByIdAsync(cmd.UserId, ct);
            if (user is null)
                return Error.NotFound("User not found.");

            user.UpdateName(cmd.Name.Trim());
            await users.SaveChangesAsync(ct);

            return new ProfileDto(user.Id, user.Email.Value, user.Name, user.AvatarUrl, user.CreatedAt);
        }
    }
}
