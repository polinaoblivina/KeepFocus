using System;
using System.Collections.Generic;
using System.Text;
using BCrypt.Net;

namespace KeepFocus.Infrastructure.Authentication
{
    public static class PasswordHasher
    {
        private const int WorkFactor = 12;

        public static string Hash(string password) =>
            BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);

        public static bool Verify(string password, string hash) =>
            BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
