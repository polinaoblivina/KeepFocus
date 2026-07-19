
using KeepFocus.Application.Features.Auth.Commands;
using KeepFocus.Application.Features.Auth.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KeepFocus.WebAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public sealed class AuthController(IMediator mediator, IWebHostEnvironment env) : ControllerBase
    {
        private const string RefreshCookieName = "refreshToken";
        private const string RefreshCookiePath = "/api/auth";

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

            SetRefreshTokenCookie(result.Value!.RefreshToken);
            return StatusCode(201, ToResponse(result.Value));
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
        {
            var result = await mediator.Send(new LoginCommand(req.Email, req.Password), ct);

            if (result.IsFailure)
                return Unauthorized(new { message = result.Error!.Message, code = result.Error.Code });

            SetRefreshTokenCookie(result.Value!.RefreshToken);
            return Ok(ToResponse(result.Value));
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(CancellationToken ct)
        {
            var refreshToken = Request.Cookies[RefreshCookieName];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { message = "No refresh token.", code = "NO_REFRESH_TOKEN" });

            var result = await mediator.Send(new RefreshCommand(refreshToken), ct);

            if (result.IsFailure)
            {
                ClearRefreshTokenCookie();
                return Unauthorized(new { message = result.Error!.Message, code = result.Error.Code });
            }

            SetRefreshTokenCookie(result.Value!.RefreshToken);
            return Ok(ToResponse(result.Value));
        }

        [AllowAnonymous]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout(CancellationToken ct)
        {
            var refreshToken = Request.Cookies[RefreshCookieName];
            if (!string.IsNullOrEmpty(refreshToken))
                await mediator.Send(new LogoutCommand(refreshToken), ct);

            ClearRefreshTokenCookie();
            return NoContent();
        }

        private static object ToResponse(AuthDto dto) => new { token = dto.Token, userId = dto.UserId, email = dto.Email };

        private void SetRefreshTokenCookie(string token)
        {
            Response.Cookies.Append(RefreshCookieName, token, new CookieOptions
            {
                HttpOnly = true,
                Secure = !env.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Path = RefreshCookiePath,
                Expires = DateTimeOffset.UtcNow.AddDays(30),
            });
        }

        private void ClearRefreshTokenCookie()
        {
            Response.Cookies.Delete(RefreshCookieName, new CookieOptions { Path = RefreshCookiePath });
        }
    }
}
