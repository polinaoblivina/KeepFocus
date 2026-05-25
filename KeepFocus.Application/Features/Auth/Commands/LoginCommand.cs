using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Common.Interfaces;
using KeepFocus.Application.Features.Auth.DTOs;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.Auth.Commands
{
    public sealed record LoginCommand(string Email, string Password) : IRequest<Result<AuthDto>>;
    public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
    {
        public LoginCommandValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty();
        }
    }

    public sealed class LoginCommandHandler(IUserRepository users, IJwtService jwt, IPasswordHasher hasher) : IRequestHandler<LoginCommand, Result<AuthDto>>
    {
        public async Task<Result<AuthDto>> Handle(LoginCommand cmd, CancellationToken ct)
        {
            var user = await users.GetByEmailAsync(cmd.Email, ct);
            if (user is null || !hasher.Verify(cmd.Password, user.PasswordHash))
                return Error.Unauthorized("Invalid email or password.", "INVALID_CREDENTIALS");

            var token = jwt.GenerateToken(user.Id, user.Email.Value);
            return new AuthDto(token, user.Id, user.Email.Value);
        }
    }
}