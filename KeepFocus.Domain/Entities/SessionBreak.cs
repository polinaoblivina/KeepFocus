using KeepFocus.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Entities
{
    public sealed class SessionBreak : Entity
    {
        public Guid SessionId { get; private set; }
        public BreakType BreakType { get; private set; }
        public int DurationSeconds { get; private set; }
        public DateTime StartedAt { get; private set; }
        private SessionBreak() : base() { }
        internal SessionBreak(Guid sessionId, BreakType breakType, int durationSeconds) : base()
        {
            SessionId = sessionId;
            BreakType = breakType;
            DurationSeconds = durationSeconds;
            StartedAt = DateTime.UtcNow;
        }
    }
}
