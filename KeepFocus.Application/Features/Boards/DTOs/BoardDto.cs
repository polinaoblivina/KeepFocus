using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.DTOs
{
    public sealed record BoardDto(Guid Id, string Title, string? Description, DateTime UpdatedAt, IReadOnlyList<ListDto> Lists);
    public sealed record BoardSummaryDto(Guid Id, string Title, string? Description, DateTime UpdatedAt);

}
