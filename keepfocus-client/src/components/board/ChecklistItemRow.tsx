import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ChecklistItemDto } from '../../api/types';

interface ChecklistItemRowProps {
    item: ChecklistItemDto;
    onToggle: () => void;
    onUpdate: (content: string) => void;
    onRemove: () => void;
}

export default function ChecklistItemRow({ item, onToggle, onUpdate, onRemove }: ChecklistItemRowProps) {
    const [editing, setEditing] = useState(false);
    const [content, setContent] = useState(item.content);

    function handleBlur() {
        setEditing(false);
        if (content.trim() && content !== item.content) onUpdate(content.trim());
        else setContent(item.content);
    }

    return (
        <div className="group flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-surface transition-colors">
            <button
                onClick={onToggle}
                className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${item.isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'
                    }`}
            >
                {item.isChecked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M2 6l3 3 5-5" />
                    </svg>
                )}
            </button>

            {editing ? (
                <input
                    type="text"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={e => e.key === 'Enter' && handleBlur()}
                    autoFocus
                    className="flex-1 text-sm bg-surface border border-blue-400 rounded px-2 py-0.5 focus:outline-none"
                />
            ) : (
                <span
                    onClick={() => setEditing(true)}
                    className={`flex-1 text-sm cursor-pointer ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-700'
                        }`}
                >
                    {item.content}
                </span>
            )}

            <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-opacity">
                <Trash2 size={11} />
            </button>

        </div>
    );
}