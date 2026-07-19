using System;
using KeepFocus.Domain.Entities;

namespace KeepFocus.Domain.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken ct = default);
        Task AddAsync(RefreshToken token, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
