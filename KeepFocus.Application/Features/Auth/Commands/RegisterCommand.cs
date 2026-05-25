using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Common.Interfaces;
using KeepFocus.Application.Features.Auth.DTOs;
using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.Auth.Commands
{
    public sealed record RegisterCommand(string Email, string Password) : IRequest<Result<AuthDto>>;
    public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Email is not valid.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
                .MaximumLength(128).WithMessage("Password must not exceed 128 characters.");
        }
    }
    public sealed class RegisterCommandHandler(IUserRepository users, IJwtService jwt, IPasswordHasher hasher) : IRequestHandler<RegisterCommand, Result<AuthDto>>
    {
        public async Task<Result<AuthDto>> Handle(RegisterCommand cmd, CancellationToken ct)
        {
            if (await users.ExistsByEmailAsync(cmd.Email, ct))
                return Error.Conflict("Email is already registered.", "EMAIL_TAKEN");

            var hash = hasher.Hash(cmd.Password);
            var user = User.Create(cmd.Email, hash);

            await users.AddAsync(user, ct);
            await users.SaveChangesAsync(ct);

            var token = jwt.GenerateToken(user.Id, user.Email.Value);
            return new AuthDto(token, user.Id, user.Email.Value);
        }
    }
}