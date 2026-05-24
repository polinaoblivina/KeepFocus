using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Domain.Entities
{
    public sealed class ChecklistItem : Entity
    {
        public Guid ChecklistId { get; private set; }
        public string Content { get; private set; }
        public bool IsChecked { get; private set; }
        public int Position { get; private set; }
        private ChecklistItem() : base() { }

        internal ChecklistItem(Guid checklistId, string content, int position) : base()
        {
            ChecklistId = checklistId;
            Content = content.Trim();
            IsChecked = false;
            Position = position;
        }

        public void Toggle() => IsChecked = !IsChecked;

        public void UpdateContent(string content)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(content);
            Content = content.Trim();
        }
        public void UpdatePosition(int position) => Position = position;
    }
}
