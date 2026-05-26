using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Enums;
using KeepFocus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Infrastructure.Persistence.Repositories
{
    internal sealed class FocusSessionRepository(AppDbContext db) : IFocusSessionRepository
    {
        public Task<FocusSession?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            db.FocusSessions
                .Include("_tabEvents")
                .Include("_breaks")
                .FirstOrDefaultAsync(s => s.Id == id, ct);

        public Task<FocusSession?> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default) =>
            db.FocusSessions
                .Include("_tabEvents")
                .Include("_breaks")
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == SessionStatus.Active, ct);

        public async Task<IReadOnlyList<FocusSession>> GetByUserIdAsync(Guid userId,DateTime? from = null,DateTime? to = null,CancellationToken ct = default)
        {
            var query = db.FocusSessions
                .Include("_tabEvents")
                .Where(s => s.UserId == userId);

            if (from.HasValue) query = query.Where(s => s.StartedAt >= from.Value);
            if (to.HasValue) query = query.Where(s => s.StartedAt <= to.Value);

            var sessions = await query
                .OrderByDescending(s => s.StartedAt)
                .ToListAsync(ct);

            return sessions.AsReadOnly();
        }

        public async Task AddAsync(FocusSession session, CancellationToken ct = default) =>
            await db.FocusSessions.AddAsync(session, ct);

        public Task SaveChangesAsync(CancellationToken ct = default) =>
            db.SaveChangesAsync(ct);
    }
}
