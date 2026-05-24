using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Entities
{
    public sealed class List : Entity
    {
        public Guid BoardId { get; private set; }
        public string Title { get; private set; }
        public int Position { get; private set; }
        public DateTime CreatedAt { get; private set; }
        private readonly List<Card> _cards = [];
        public IReadOnlyList<Card> Cards => _cards.AsReadOnly();
        private List() : base() { }

        internal List(Guid boardId, string title, int position) : base()
        {
            BoardId = boardId;
            Title = title.Trim();
            Position = position;
            CreatedAt = DateTime.UtcNow;
        }
        public Card AddCard(string title)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(title);
            var position = _cards.Count == 0 ? 1000 : _cards.Max(c => c.Position) + 1000;
            var card = new Card(Id, title, position);
            _cards.Add(card);
            return card;
        }
        public void RemoveCard(Guid cardId)
        {
            var card = _cards.FirstOrDefault(c => c.Id == cardId)
                ?? throw new InvalidOperationException($"Card '{cardId}' not found.");
            _cards.Remove(card);
        }
        public void UpdateTitle(string title)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(title);
            Title = title.Trim();
        }
        public void UpdatePosition(int position) => Position = position;
    }
}
