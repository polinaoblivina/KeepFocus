using KeepFocus.Domain.Entities;

namespace KeepFocus.Domain.Interfaces
{
    public interface IFocusSessionRepository
    {
        Task<FocusSession?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<FocusSession?> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default);
        Task<IReadOnlyList<FocusSession>> GetByUserIdAsync(Guid userId, DateTime? from = null, DateTime? to = null, CancellationToken ct = default);
        Task AddAsync(FocusSession session, CancellationToken ct = default);
        Task AddTabEventAsync(TabEvent tabEvent, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}