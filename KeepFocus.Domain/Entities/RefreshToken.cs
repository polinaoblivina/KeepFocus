using System;

namespace KeepFocus.Domain.Entities
{
    public sealed class RefreshToken : Entity
    {
        public Guid UserId { get; private set; }
        public string TokenHash { get; private set; }
        public DateTime ExpiresAt { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? RevokedAt { get; private set; }

        public bool IsActive => RevokedAt is null && ExpiresAt > DateTime.UtcNow;

        private RefreshToken() : base() { }

        private RefreshToken(Guid userId, string tokenHash, DateTime expiresAt) : base()
        {
            UserId = userId;
            TokenHash = tokenHash;
            ExpiresAt = expiresAt;
            CreatedAt = DateTime.UtcNow;
        }

        public static RefreshToken Create(Guid userId, string tokenHash, DateTime expiresAt) =>
            new(userId, tokenHash, expiresAt);

        public void Revoke()
        {
            RevokedAt = DateTime.UtcNow;
        }
    }
}
