namespace KeepFocus.Application.Common.Interfaces
{
    public interface IAvatarStorage
    {
        Task<string> SaveAsync(Stream content, string extension, CancellationToken ct = default);
        void Delete(string relativeUrl);
    }
}
