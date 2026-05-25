using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.DTOs
{
    public sealed record CardDto(Guid Id, string Title, string? Description, int Position, DateOnly? DueDate, IReadOnlyList<ChecklistDto> Checklists);
}
