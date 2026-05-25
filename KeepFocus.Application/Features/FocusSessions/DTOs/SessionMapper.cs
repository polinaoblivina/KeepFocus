using KeepFocus.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.FocusSessions.DTOs
{
    internal static class SessionMapper
    {
        public static SessionDto ToDto(FocusSession s) => new(
            s.Id,
            s.CardId,
            s.Type.ToString(),
            s.Mode.ToString(),
            s.Status.ToString(),
            s.PlannedDuration.Seconds,
            s.GetCurrentElapsed(),
            s.AccumulatedSeconds,
            s.StartedAt,
            s.EndedAt,
            s.DistractionCount,
            s.TotalDistractionSeconds);
    }
}
