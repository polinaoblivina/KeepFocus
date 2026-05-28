using KeepFocus.Application.Common.Errors;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace KeepFocus.WebAPI.Controllers
{
    [ApiController]
    [Authorize]
    public abstract class BaseController(IMediator mediator) : ControllerBase
    {
        protected readonly IMediator Mediator = mediator;
        protected Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        protected IActionResult MapError(Error error)
        {
            switch (error.Type)
            {
                case ErrorType.NotFound:
                    return NotFound(new { message = error.Message });
                case ErrorType.Conflict:
                    return Conflict(new { message = error.Message });
                case ErrorType.Forbidden:
                    return Forbid();
                case ErrorType.Unauthorized:
                    return Unauthorized(new { message = error.Message });
                default:
                    return BadRequest(new { message = error.Message });
            }
        }
    }
}