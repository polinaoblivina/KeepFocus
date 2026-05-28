using KeepFocus.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Interfaces
{
    public interface IBoardRepository
    {
        Task<Board?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<Board?> GetWithListsAsync(Guid id, CancellationToken ct = default);
        Task<Board?> GetFullAsync(Guid id, CancellationToken ct = default);
        Task<IReadOnlyList<Board>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
        Task AddAsync(Board board, CancellationToken ct = default);
        Task RemoveAsync(Guid id, CancellationToken ct = default);
        Task AddListAsync(Entities.List list, CancellationToken ct = default);
        Task AddCardAsync(Card card, CancellationToken ct = default);
        Task AddChecklistAsync(Checklist checklist, CancellationToken ct = default);
        Task AddChecklistItemAsync(ChecklistItem item, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
