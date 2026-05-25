using KeepFocus.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Entities
{
    public sealed class Board : Entity
    {
        public Guid UserId { get; private set; }
        public string Title { get; private set; }
        public string? Description { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        private readonly List<List> _lists = [];
        public IReadOnlyList<List> Lists => _lists.AsReadOnly();
        private Board() : base() { }

        private Board(Guid userId, string title, string? description) : base()
        {
            UserId = userId;
            Title = title.Trim();
            Description = description?.Trim();
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        public static Board Create(Guid userId, string title, string? description = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(title);
            return new Board(userId, title, description);
        }
        public void Update(string title, string? description)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(title);
            Title = title.Trim();
            Description = description?.Trim();
            Touch();
        }
        public List AddList(string title)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(title);
            var position = _lists.Count == 0 ? 1000 : _lists.Max(l => l.Position) + 1000;
            var list = new List(Id, title, position);
            _lists.Add(list);
            Touch();
            return list;
        }
        public void RemoveList(Guid listId)
        {
            var list = GetList(listId);
            _lists.Remove(list);
            Touch();
        }

        public void RenameList(Guid listId, string title) => GetList(listId).UpdateTitle(title);

        public void ReorderLists(IEnumerable<(Guid ListId, int Position)> positions)
        {
            foreach (var (listId, position) in positions)
                GetList(listId).UpdatePosition(position);
            Touch();
        }
        public Card AddCard(Guid listId, string title)
        {
            var card = GetList(listId).AddCard(title);
            Touch();
            return card;
        }

        public void RemoveCard(Guid listId, Guid cardId)
        {
            GetList(listId).RemoveCard(cardId);
            Touch();
        }

        public void MoveCard(Guid cardId, Guid targetListId, int position)
        {
            var card = _lists.SelectMany(l => l.Cards).FirstOrDefault(c => c.Id == cardId)
               ?? throw new EntityNotFoundException("Card", cardId);
            GetList(targetListId);
            card.MoveTo(targetListId, position);
            Touch();
        }
        public void UpdateCard(Guid cardId, string title, string? description, DateOnly? dueDate)
        {
            GetCard(cardId).Update(title, description, dueDate);
            Touch();
        }
        public Checklist AddChecklist(Guid cardId, string title)
        {
            var checklist = GetCard(cardId).AddChecklist(title);
            Touch();
            return checklist;
        }

        public void RemoveChecklist(Guid cardId, Guid checklistId)
        {
            GetCard(cardId).RemoveChecklist(checklistId);
            Touch();
        }

        public void UpdateChecklistTitle(Guid cardId, Guid checklistId, string title)
        {
            GetChecklist(cardId, checklistId).UpdateTitle(title);
            Touch();
        }
        public ChecklistItem AddChecklistItem(Guid cardId, Guid checklistId, string content)
        {
            var item = GetChecklist(cardId, checklistId).AddItem(content);
            Touch();
            return item;
        }

        public void RemoveChecklistItem(Guid cardId, Guid checklistId, Guid itemId)
        {
            GetChecklist(cardId, checklistId).RemoveItem(itemId);
            Touch();
        }

        public void ToggleChecklistItem(Guid cardId, Guid checklistId, Guid itemId)
        {
            GetChecklistItem(cardId, checklistId, itemId).Toggle();
            Touch();
        }

        public void UpdateChecklistItemContent(Guid cardId, Guid checklistId, Guid itemId, string content)
        {
            GetChecklistItem(cardId, checklistId, itemId).UpdateContent(content);
            Touch();
        }

        public void ReorderChecklistItems(Guid cardId, Guid checklistId, IEnumerable<(Guid ItemId, int Position)> positions)
        {
            var checklist = GetChecklist(cardId, checklistId);
            foreach (var (itemId, position) in positions)
                GetChecklistItem(checklist, itemId).UpdatePosition(position);
            Touch();
        }
        private List GetList(Guid listId) =>
            _lists.FirstOrDefault(l => l.Id == listId)

            ?? throw new EntityNotFoundException("List", listId);

        private Card GetCard(Guid cardId) =>
            _lists.SelectMany(l => l.Cards).FirstOrDefault(c => c.Id == cardId)
            ?? throw new EntityNotFoundException("Card", cardId);

        private Checklist GetChecklist(Guid cardId, Guid checklistId) =>
            GetCard(cardId).Checklists.FirstOrDefault(cl => cl.Id == checklistId)
            ?? throw new EntityNotFoundException("Checklist", checklistId);

        private ChecklistItem GetChecklistItem(Guid cardId, Guid checklistId, Guid itemId) =>
            GetChecklistItem(GetChecklist(cardId, checklistId), itemId);

        private static ChecklistItem GetChecklistItem(Checklist checklist, Guid itemId) =>
            checklist.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new EntityNotFoundException("ChecklistItem", itemId);

        private void Touch() => UpdatedAt = DateTime.UtcNow;
    }
}