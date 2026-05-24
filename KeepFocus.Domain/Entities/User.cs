using KeepFocus.Domain.Value_Objects;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Entities
{
    public sealed class User : Entity
    {
        public Email Email { get; private set; }
        public string PasswordHash { get; private set; }
        public string? MagicLinkToken { get; private set; }
        public DateTime? MagicLinkExpiresAt { get; private set; }
        public DateTime CreatedAt { get; private set; }
        private User() : base() { }

        private User(Email email, string passwordHash) : base()
        {
            Email = email;
            PasswordHash = passwordHash;
            CreatedAt = DateTime.UtcNow;
        }

        public static User Create(string email, string passwordHash)
        {
            var validatedEmail = Email.Create(email);
            return new User(validatedEmail, passwordHash);
        }
        public void IssueMagicLink(string token, TimeSpan validity)
        {
            MagicLinkToken = token;
            MagicLinkExpiresAt = DateTime.UtcNow.Add(validity);
        }
        public bool TryConsumeMagicLink(string token)
        {
            if (MagicLinkToken is null || MagicLinkExpiresAt is null)
                return false;

            if (MagicLinkToken != token || DateTime.UtcNow > MagicLinkExpiresAt)
            {
                ClearMagicLink();
                return false;
            }

            ClearMagicLink();
            return true;
        }
        public void UpdatePasswordHash(string newHash)
        {
            PasswordHash = newHash;
        }
        private void ClearMagicLink()
        {
            MagicLinkToken = null;
            MagicLinkExpiresAt = null;
        }
    }
}
