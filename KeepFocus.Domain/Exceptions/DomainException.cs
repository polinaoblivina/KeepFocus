using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Exceptions
{
    public abstract class DomainException : Exception
    {
        protected DomainException(string message) : base(message) { }
    }
    public sealed class InvalidEmailException(string email)
        : DomainException($"'{email}' is not a valid email address.");

    public sealed class InvalidDurationException(int seconds)
        : DomainException($"Duration '{seconds}s' is not valid. Must be between 1 and 86400 seconds.");

    public sealed class SessionAlreadyActiveException()
        : DomainException("Cannot start a new session while another one is active.");

    public sealed class SessionNotActiveException()
        : DomainException("Operation requires an active session.");

    public sealed class InvalidPositionException(int position)
        : DomainException($"Position '{position}' is not valid. Must be a positive integer.");
}
