using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.FocusSessions.DTOs
{
    public sealed record SessionDto(
        Guid Id,
        Guid? CardId,
        string Type,
        string Mode,
        string Status,
        int PlannedDurationSeconds,
        int ElapsedSeconds,
        int AccumulatedSeconds,
        DateTime StartedAt,
        DateTime? EndedAt,
        int DistractionCount,
        int TotalDistractionSeconds);
}
