using KeepFocus.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace KeepFocus.Domain.Value_Objects
{
    public sealed class Email : IEquatable<Email>
    {
        private static readonly Regex EmailRegex = new(
            @"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase,
            TimeSpan.FromMilliseconds(250));
        public string Value { get; }
        private Email(string value) => Value = value;

        public static Email Create(string raw)
        {
            var trimmed = raw?.Trim() ?? string.Empty;

            if (!EmailRegex.IsMatch(trimmed))
                throw new InvalidEmailException(trimmed);

            return new Email(trimmed.ToLowerInvariant());
        }

        public bool Equals(Email? other) => other is not null && Value == other.Value;
        public override bool Equals(object? obj) => obj is Email other && Equals(other);
        public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);
        public override string ToString() => Value;

        public static implicit operator string(Email email) => email.Value;
    }
}
