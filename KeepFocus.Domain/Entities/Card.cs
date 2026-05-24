using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Entities
{
    public sealed class Card : Entity
    {
        public Guid ListId { get; private set; }
        public string Title { get; private set; }
        public string? Description { get; private set; }
        public int Position { get; private set; }
        public DateOnly? DueDate { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        private readonly List<Checklist> _checklists = [];
        public IReadOnlyList<Checklist> Checklists => _checklists.AsReadOnly();

        private Card() : base() { }

        internal Card(Guid listId, string title, int position) : base()
        {
            ListId = listId;
            Title = title.Trim();
            Position = position;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Update(string title, string? description, DateOnly? dueDate)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(title);
            Title = title.Trim();
            Description = description?.Trim();
            DueDate = dueDate;
            UpdatedAt = DateTime.UtcNow;
        }
        public void MoveTo(Guid listId, int position)
        {
            ListId = listId;
            Position = position;
            UpdatedAt = DateTime.UtcNow;
        }
        public Checklist AddChecklist(string title)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(title);
            var checklist = new Checklist(Id, title);
            _checklists.Add(checklist);
            UpdatedAt = DateTime.UtcNow;
            return checklist;
        }
        public void RemoveChecklist(Guid checklistId)
        {
            var checklist = _checklists.FirstOrDefault(c => c.Id == checklistId)
                ?? throw new InvalidOperationException($"Checklist '{checklistId}' not found.");
            _checklists.Remove(checklist);
            UpdatedAt = DateTime.UtcNow;
        }
        public void UpdatePosition(int position)
        {
            Position = position;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
