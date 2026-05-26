
using KeepFocus.Application.Features.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KeepFocus.WebAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public sealed class AuthController(IMediator mediator) : ControllerBase
    {
        public sealed record RegisterRequest(string Email, string Password);
        public sealed record LoginRequest(string Email, string Password);

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
        {
            var result = await mediator.Send(new RegisterCommand(req.Email, req.Password), ct);
            if (result.IsFailure)
            {
                switch (result.Error!.Code)
                {
                    case "EMAIL_TAKEN":
                        return Conflict(new { message = result.Error.Message, code = result.Error.Code });
                    default:
                        return BadRequest(new { message = result.Error.Message });
                }
            }

            return StatusCode(201, result.Value);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
        {
            var result = await mediator.Send(new LoginCommand(req.Email, req.Password), ct);

            if (result.IsFailure)
                return Unauthorized(new { message = result.Error!.Message, code = result.Error.Code });

            return Ok(result.Value);
        }
    }
}