using KeepFocus.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace KeepFocus.Infrastructure.Storage
{
    internal sealed class LocalAvatarStorage(IConfiguration config) : IAvatarStorage
    {
        private string PhysicalRoot =>
            Path.Combine(Directory.GetCurrentDirectory(), config["Avatars:StoragePath"] ?? "wwwroot/avatars");

        public async Task<string> SaveAsync(Stream content, string extension, CancellationToken ct = default)
        {
            var root = PhysicalRoot;
            Directory.CreateDirectory(root);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var physicalPath = Path.Combine(root, fileName);

            await using var fileStream = File.Create(physicalPath);
            await content.CopyToAsync(fileStream, ct);

            return $"/avatars/{fileName}";
        }

        public void Delete(string relativeUrl)
        {
            var fileName = Path.GetFileName(relativeUrl);
            if (string.IsNullOrEmpty(fileName)) return;

            var physicalPath = Path.Combine(PhysicalRoot, fileName);
            if (File.Exists(physicalPath))
                File.Delete(physicalPath);
        }
    }
}
