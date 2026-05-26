using KeepFocus.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Interfaces
{
    public interface IFocusSessionRepository
    {
        Task<FocusSession?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<FocusSession?> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default);
        Task<IReadOnlyList<FocusSession>> GetByUserIdAsync(Guid userId, DateTime? from = null, DateTime? to = null, CancellationToken ct = default);
        Task AddAsync(FocusSession session, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
