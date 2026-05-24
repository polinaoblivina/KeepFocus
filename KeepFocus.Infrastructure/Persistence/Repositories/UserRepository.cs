using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Infrastructure.Persistence.Repositories
{
    internal sealed class UserRepository(AppDbContext db) : IUserRepository
    {
        public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

        public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
            db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

        public Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default) =>
            db.Users.AnyAsync(u => u.Email == email, ct);

        public async Task AddAsync(User user, CancellationToken ct = default) =>
            await db.Users.AddAsync(user, ct);

        public Task SaveChangesAsync(CancellationToken ct = default) =>
            db.SaveChangesAsync(ct);
    }
}


