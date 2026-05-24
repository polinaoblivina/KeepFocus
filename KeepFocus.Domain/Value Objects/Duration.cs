using KeepFocus.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Value_Objects
{
    public sealed class Duration : IEquatable<Duration>, IComparable<Duration>
    {
        public const int MinSeconds = 1;
        public const int MaxSeconds = 86400; 

        public static readonly Duration Pomodoro = new(25 * 60);
        public static readonly Duration ShortBreak = new(5 * 60);
        public static readonly Duration LongBreak = new(15 * 60);

        public int Seconds { get; }
        public TimeSpan TimeSpan => TimeSpan.FromSeconds(Seconds);
        private Duration(int seconds) => Seconds = seconds;

        public static Duration Create(int seconds)
        {
            if (seconds < MinSeconds || seconds > MaxSeconds)
                throw new InvalidDurationException(seconds);

            return new Duration(seconds);
        }

        public static Duration FromMinutes(int minutes) => Create(minutes * 60);
        public Duration Add(int seconds) => Create(Seconds + seconds);
        public bool Equals(Duration? other) => other is not null && Seconds == other.Seconds;
        public override bool Equals(object? obj) => obj is Duration other && Equals(other);
        public override int GetHashCode() => Seconds.GetHashCode();
        public int CompareTo(Duration? other) => other is null ? 1 : Seconds.CompareTo(other.Seconds);
        public override string ToString() => $"{Seconds}s ({TimeSpan:hh\\:mm\\:ss})";

        public static bool operator <(Duration a, Duration b) => a.Seconds < b.Seconds;
        public static bool operator >(Duration a, Duration b) => a.Seconds > b.Seconds;
        public static implicit operator int(Duration d) => d.Seconds;
    }
}
