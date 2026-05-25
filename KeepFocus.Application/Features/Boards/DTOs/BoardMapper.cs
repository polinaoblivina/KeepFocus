using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Domain.Entities;

namespace KeepFocus.Application.Features.Boards.DTOs
{
    internal static class BoardMapper
    {
        public static BoardSummaryDto ToSummary(Board b) => new(b.Id, b.Title, b.Description, b.UpdatedAt);

        public static BoardDto ToFull(Board b) => new(
            b.Id, b.Title, b.Description, b.UpdatedAt,
            b.Lists
                .OrderBy(l => l.Position)
                .Select(ToList)
                .ToList()
                .AsReadOnly());

        private static ListDto ToList(Domain.Entities.List l) => new(
            l.Id, l.Title, l.Position,
            l.Cards
                .OrderBy(c => c.Position)
                .Select(ToCard)
                .ToList()
                .AsReadOnly());

        private static CardDto ToCard(Card c) => new(
            c.Id, c.Title, c.Description, c.Position, c.DueDate,
            c.Checklists
                .Select(ToChecklist)
                .ToList()
                .AsReadOnly());

        private static ChecklistDto ToChecklist(Checklist cl) => new(
            cl.Id, cl.Title, cl.CompletedCount, cl.TotalCount,
            cl.Items
                .OrderBy(i => i.Position)
                .Select(i => new ChecklistItemDto(i.Id, i.Content, i.IsChecked, i.Position))
                .ToList()
                .AsReadOnly());
    }
}