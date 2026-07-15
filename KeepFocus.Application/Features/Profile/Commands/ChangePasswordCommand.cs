using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Common.Interfaces;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.Profile.Commands
{
    public sealed record ChangePasswordCommand(Guid UserId, string CurrentPassword, string NewPassword) : IRequest<Result>;

    public sealed class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
    {
        public ChangePasswordCommandValidator()
        {
            RuleFor(x => x.CurrentPassword).NotEmpty();

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
                .MaximumLength(128).WithMessage("Password must not exceed 128 characters.");
        }
    }

    public sealed class ChangePasswordCommandHandler(IUserRepository users, IPasswordHasher hasher) : IRequestHandler<ChangePasswordCommand, Result>
    {
        public async Task<Result> Handle(ChangePasswordCommand cmd, CancellationToken ct)
        {
            var user = await users.GetByIdAsync(cmd.UserId, ct);
            if (user is null)
                return Error.NotFound("User not found.");

            if (!hasher.Verify(cmd.CurrentPassword, user.PasswordHash))
                return Error.Validation("Текущий пароль неверен.", "WRONG_PASSWORD");

            user.UpdatePasswordHash(hasher.Hash(cmd.NewPassword));
            await users.SaveChangesAsync(ct);

            return Result.Ok;
        }
    }
}
