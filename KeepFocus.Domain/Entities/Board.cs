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

        public void RenameList(Guid listId, string title) =>
            GetList(listId).UpdateTitle(title);

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
                ?? throw new InvalidOperationException($"Card '{cardId}' not found on board '{Id}'.");

            GetList(targetListId);

            card.MoveTo(targetListId, position);
            Touch();
        }

        public void UpdateCard(Guid cardId, string title, string? description, DateOnly? dueDate)
        {
            var card = GetCard(cardId);
            card.Update(title, description, dueDate);
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
        public void Update(string title, string? description)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(title);
            Title = title.Trim();
            Description = description?.Trim();
            Touch();
        }
        private List GetList(Guid listId) =>
            _lists.FirstOrDefault(l => l.Id == listId)
            ?? throw new InvalidOperationException($"List '{listId}' not found on board '{Id}'.");

        private Card GetCard(Guid cardId) =>
            _lists.SelectMany(l => l.Cards).FirstOrDefault(c => c.Id == cardId)
            ?? throw new InvalidOperationException($"Card '{cardId}' not found on board '{Id}'.");

        private void Touch() => UpdatedAt = DateTime.UtcNow;
    }
}
