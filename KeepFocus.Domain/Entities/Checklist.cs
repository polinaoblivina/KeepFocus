using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Entities
{
    public sealed class Checklist : Entity
    {
        public Guid CardId { get; private set; }
        public string Title { get; private set; }
        public DateTime CreatedAt { get; private set; }

        private readonly List<ChecklistItem> _items = [];
        public IReadOnlyList<ChecklistItem> Items => _items.AsReadOnly();
        public int CompletedCount => _items.Count(i => i.IsChecked);
        public int TotalCount => _items.Count;
        public double ProgressPercent => TotalCount == 0 ? 0 : (double)CompletedCount / TotalCount * 100;

        private Checklist() : base() { }

        internal Checklist(Guid cardId, string title) : base()
        {
            CardId = cardId;
            Title = title.Trim();
            CreatedAt = DateTime.UtcNow;
        }

        public ChecklistItem AddItem(string content)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(content);
            var position = _items.Count == 0 ? 1000 : _items.Max(i => i.Position) + 1000;
            var item = new ChecklistItem(Id, content, position);
            _items.Add(item);
            return item;
        }

        public void RemoveItem(Guid itemId)
        {
            var item = _items.FirstOrDefault(i => i.Id == itemId)
                ?? throw new InvalidOperationException($"ChecklistItem '{itemId}' not found.");
            _items.Remove(item);
        }

        public void UpdateTitle(string title)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(title);
            Title = title.Trim();
        }
    }
}
