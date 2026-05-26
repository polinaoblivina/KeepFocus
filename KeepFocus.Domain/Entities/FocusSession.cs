using KeepFocus.Domain.Enums;
using KeepFocus.Domain.Exceptions;
using KeepFocus.Domain.Value_Objects;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Entities
{
    public sealed class FocusSession : Entity
    {
        public Guid UserId { get; private set; }
        public Guid? CardId { get; private set; }
        public SessionType Type { get; private set; }
        public FocusMode Mode { get; private set; }
        public Duration PlannedDuration { get; private set; }
        public int AccumulatedSeconds { get; private set; }
        public DateTime LastResumedAt { get; private set; }
        public SessionStatus Status { get; private set; }
        public DateTime StartedAt { get; private set; }
        public DateTime? EndedAt { get; private set; }

        private readonly List<TabEvent> _tabEvents = [];
        public IReadOnlyList<TabEvent> TabEvents => _tabEvents.AsReadOnly();

        private readonly List<SessionBreak> _breaks = [];
        public IReadOnlyList<SessionBreak> Breaks => _breaks.AsReadOnly();

        public int GetCurrentElapsed()
        {
            if (Status == SessionStatus.Paused ||
                Status == SessionStatus.Completed ||
                Status == SessionStatus.Abandoned)
            {
                return AccumulatedSeconds;
            }
            var liveSeconds = (int)(DateTime.UtcNow - LastResumedAt).TotalSeconds;
            return AccumulatedSeconds + liveSeconds;
        }

        public int TotalDistractionSeconds => _tabEvents
            .Where(e => e.EventType == TabEventType.Visible)
            .Sum(e => e.DurationSeconds);

        public int DistractionCount => _tabEvents
            .Count(e => e.EventType == TabEventType.Hidden);
        public bool IsActive => Status == SessionStatus.Active;
        public bool IsCompleted => Status == SessionStatus.Completed;

        private FocusSession() : base() { }
        private FocusSession(Guid userId, Guid? cardId, SessionType type, FocusMode mode, Duration plannedDuration) : base()
        {
            UserId = userId;
            CardId = cardId;
            Type = type;
            Mode = mode;
            PlannedDuration = plannedDuration;
            AccumulatedSeconds = 0;
            Status = SessionStatus.Active;
            StartedAt = DateTime.UtcNow;
            LastResumedAt = DateTime.UtcNow;  
        }

        public static FocusSession StartPomodoro(Guid userId, FocusMode mode, Guid? cardId = null) =>
            new(userId, cardId, SessionType.Pomodoro, mode, Duration.Pomodoro);

        public static FocusSession StartCustom(Guid userId, FocusMode mode, int durationSeconds, Guid? cardId = null) =>
            new(userId, cardId, SessionType.Custom, mode, Duration.Create(durationSeconds));

        public void Pause()
        {
            EnsureActive();
            AccumulatedSeconds = GetCurrentElapsed();
            Status = SessionStatus.Paused;
        }
        public void Resume()
        {
            if (Status != SessionStatus.Paused)
                throw new SessionNotActiveException();

            LastResumedAt = DateTime.UtcNow;   
            LastHeartbeatAt = DateTime.UtcNow;
            Status = SessionStatus.Active;
        }
        public void Complete()
        {
            EnsureActive();
            AccumulatedSeconds = GetCurrentElapsed(); 
            Status = SessionStatus.Completed;
            EndedAt = DateTime.UtcNow;
        }
        public void Abandon()
        {
            if (Status is SessionStatus.Completed or SessionStatus.Abandoned)
                return;

            if (Status == SessionStatus.Active)
            {
                var lastHidden = _tabEvents
                    .Where(e => e.EventType == TabEventType.Hidden)
                    .OrderBy(e => e.OccurredAt)
                    .LastOrDefault();

                var hasReturnedAfterLastHide = lastHidden != null && _tabEvents
                    .Any(e => e.EventType == TabEventType.Visible && e.OccurredAt > lastHidden.OccurredAt);

                if (lastHidden != null && !hasReturnedAfterLastHide)
                {
                    var secondsUntilHide = (int)(lastHidden.OccurredAt - LastResumedAt).TotalSeconds;
                    AccumulatedSeconds += Math.Max(0, secondsUntilHide);
                }
                else
                {
                    AccumulatedSeconds = GetCurrentElapsed();
                }
            }

            Status = SessionStatus.Abandoned;
            EndedAt = DateTime.UtcNow;
        }
        public TabEvent RecordTabHidden(int visibleDurationSeconds)
        {
            EnsureActive();

            var ev = new TabEvent(Id, TabEventType.Hidden, visibleDurationSeconds);
            _tabEvents.Add(ev);

            if (Mode == FocusMode.Hard)
                Pause();

            return ev;
        }
        public TabEvent RecordTabVisible(int hiddenDurationSeconds)
        {
            if (Mode == FocusMode.Hard && Status == SessionStatus.Paused)
                Resume();

            if (Status != SessionStatus.Active)
                throw new SessionNotActiveException();

            var ev = new TabEvent(Id, TabEventType.Visible, hiddenDurationSeconds);
            _tabEvents.Add(ev);
            return ev;
        }
        public SessionBreak StartBreak(BreakType breakType, int durationSeconds)
        {
            EnsureActive();
            var sessionBreak = new SessionBreak(Id, breakType, durationSeconds);
            _breaks.Add(sessionBreak);
            return sessionBreak;
        }
        private void EnsureActive()
        {
            if (Status != SessionStatus.Active)
                throw new SessionNotActiveException();
        }
    }
}
