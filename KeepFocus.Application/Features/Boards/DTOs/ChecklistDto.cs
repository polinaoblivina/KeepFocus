using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.DTOs
{
    public sealed record ChecklistDto(Guid Id, string Title, int CompletedCount, int TotalCount, IReadOnlyList<ChecklistItemDto> Items);
    public sealed record ChecklistItemDto(Guid Id, string Content, bool IsChecked, int Position);
    public sealed record ChecklistItemPositionDto(Guid ItemId, int Position);

}
