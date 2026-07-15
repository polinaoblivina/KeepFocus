using KeepFocus.Application.Features.Profile.Commands;
using KeepFocus.Application.Features.Profile.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KeepFocus.WebAPI.Controllers
{
    [Route("api/profile")]
    public sealed class ProfileController(IMediator mediator) : BaseController(mediator)
    {
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg", "image/png", "image/webp"
        };
        private const long MaxAvatarSizeBytes = 5 * 1024 * 1024;

        public sealed record UpdateProfileRequest(string Name);
        public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);

        [HttpGet]
        public async Task<IActionResult> GetProfile(CancellationToken ct)
        {
            var result = await Mediator.Send(new GetProfileQuery(UserId), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new UpdateProfileCommand(UserId, req.Name), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new ChangePasswordCommand(UserId, req.CurrentPassword, req.NewPassword), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file, CancellationToken ct)
        {
            if (file is null || file.Length == 0)
                return BadRequest(new { message = "Файл не выбран." });

            if (!AllowedContentTypes.Contains(file.ContentType))
                return BadRequest(new { message = "Допустимы только изображения JPEG, PNG или WebP." });

            if (file.Length > MaxAvatarSizeBytes)
                return BadRequest(new { message = "Изображение слишком большое (макс. 5 МБ)." });

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrEmpty(extension))
                extension = file.ContentType switch
                {
                    "image/jpeg" => ".jpg",
                    "image/png" => ".png",
                    "image/webp" => ".webp",
                    _ => ".jpg"
                };

            await using var stream = file.OpenReadStream();
            var result = await Mediator.Send(new UploadAvatarCommand(UserId, stream, extension), ct);
            if (result.IsFailure)
                return MapError(result.Error!);

            return Ok(new { avatarUrl = result.Value });
        }

        [HttpDelete("avatar")]
        public async Task<IActionResult> DeleteAvatar(CancellationToken ct)
        {
            var result = await Mediator.Send(new DeleteAvatarCommand(UserId), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return NoContent();
        }
    }
}
