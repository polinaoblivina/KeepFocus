using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace KeepFocus.Infrastructure.Persistence.Repositories
{
    internal sealed class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
    {
        public Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken ct = default) =>
            db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

        public async Task AddAsync(RefreshToken token, CancellationToken ct = default) =>
            await db.RefreshTokens.AddAsync(token, ct);

        public Task SaveChangesAsync(CancellationToken ct = default) =>
            db.SaveChangesAsync(ct);
    }
}
