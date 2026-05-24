using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Enums;
using KeepFocus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Infrastructure.Persistence.Repositories
{
    internal sealed class BoardRepository(AppDbContext db) : IBoardRepository
    {
        public Task<Board?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            db.Boards.FirstOrDefaultAsync(b => b.Id == id, ct);

        public Task<Board?> GetWithListsAsync(Guid id, CancellationToken ct = default) =>
            db.Boards
             .Include("_lists._cards")
             .FirstOrDefaultAsync(b => b.Id == id, ct);

        public Task<Board?> GetFullAsync(Guid id, CancellationToken ct = default) =>
            db.Boards
                .Include("_lists._cards._checklists._items")
                .FirstOrDefaultAsync(b => b.Id == id, ct);

        public async Task<IReadOnlyList<Board>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        {
            var boards = await db.Boards
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.UpdatedAt)
                .ToListAsync(ct);

            return boards.AsReadOnly();
        }

        public async Task AddAsync(Board board, CancellationToken ct = default) =>
            await db.Boards.AddAsync(board, ct);

        public async Task RemoveAsync(Guid id, CancellationToken ct = default)
        {
            var board = await db.Boards.FindAsync([id], ct);
            if (board is not null) db.Boards.Remove(board);
        }

        public Task SaveChangesAsync(CancellationToken ct = default) =>
            db.SaveChangesAsync(ct);
    }
}
