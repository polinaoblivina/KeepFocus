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
        public void UpdatePasswordHash(string newHash)
        {
            PasswordHash = newHash;
        }
    }
}
