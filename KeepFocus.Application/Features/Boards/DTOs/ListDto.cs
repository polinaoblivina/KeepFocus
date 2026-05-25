using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.DTOs
{
    public sealed record ListDto(Guid Id, string Title, int Position, IReadOnlyList<CardDto> Cards);
    public sealed record ListPositionDto(Guid ListId, int Position);

}
