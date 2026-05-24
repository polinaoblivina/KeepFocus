using KeepFocus.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Entities
{
    public sealed class TabEvent : Entity
    {
        public Guid SessionId { get; private set; }
        public TabEventType EventType { get; private set; }
        public int DurationSeconds { get; private set; }
        public DateTime OccurredAt { get; private set; }
        private TabEvent() : base() { }

        internal TabEvent(Guid sessionId, TabEventType eventType, int durationSeconds) : base()
        {
            SessionId = sessionId;
            EventType = eventType;
            DurationSeconds = durationSeconds;
            OccurredAt = DateTime.UtcNow;
        }
    }
}
