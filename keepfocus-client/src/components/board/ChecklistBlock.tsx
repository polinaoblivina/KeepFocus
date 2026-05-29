import { useState } from 'react';
import { Plus, Trash2, CheckSquare } from 'lucide-react';
import type { ChecklistDto } from '../../api/types';
import ChecklistItemRow from './ChecklistItemRow';

interface ChecklistBlockProps {
    checklist: ChecklistDto;
    onRename: (title: string) => void;
    onRemove: () => void;
    onAddItem: (content: string) => void;
    onToggle: (itemId: string, currentChecked: boolean) => void;
    onUpdateItem: (itemId: string, content: string) => void;
    onRemoveItem: (itemId: string, isChecked: boolean) => void;
}

export default function ChecklistBlock({checklist, onRename, onRemove, onAddItem, onToggle, onUpdateItem, onRemoveItem}: ChecklistBlockProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [title, setTitle] = useState(checklist.title);
    const [addingItem, setAddingItem] = useState(false);
    const [newItem, setNewItem] = useState('');

    const progress = checklist.totalCount > 0 ? Math.round((checklist.completedCount / checklist.totalCount) * 100) : 0;

    function handleRenameBlur() {
        setEditingTitle(false);
        if (title.trim() && title !== checklist.title) onRename(title.trim());
        else setTitle(checklist.title);
    }

    function handleAddItem(e: React.FormEvent) {
        e.preventDefault();
        if (!newItem.trim()) return;
        onAddItem(newItem.trim());
        setNewItem('');
        setAddingItem(false);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                    <CheckSquare size={14} className="text-gray-400 flex-shrink-0" />
                    {editingTitle ? (
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onBlur={handleRenameBlur}
                            onKeyDown={e => e.key === 'Enter' && handleRenameBlur()}
                            autoFocus
                            className="flex-1 text-sm font-semibold bg-white border border-blue-400 rounded px-2 py-0.5 focus:outline-none"
                        />
                    ) : (
                        <span
                            className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-blue-600"
                            onClick={() => setEditingTitle(true)}
                        >
                            {checklist.title}
                        </span>
                    )}
                </div>
                <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                </button>
            </div>

            {checklist.totalCount > 0 && (
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-gray-400 w-8 text-right">{progress}%</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1 mb-2">
                {checklist.items
                    .sort((a, b) => a.position - b.position)
                    .map(item => (
                        <ChecklistItemRow
                            key={item.id}
                            item={item}
                            onToggle={() => onToggle(item.id, item.isChecked)}
                            onUpdate={content => onUpdateItem(item.id, content)}
                            onRemove={() => onRemoveItem(item.id, item.isChecked)}
                        />
                    ))
                }
            </div>

            {addingItem ? (
                <form onSubmit={handleAddItem} className="ml-6">
                    <input
                        type="text"
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        placeholder="Новый пункт..."
                        autoFocus
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1"
                    />
                    <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors">
                            Добавить
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAddingItem(false); setNewItem(''); }}
                            className="px-3 py-1 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setAddingItem(true)}
                    className="ml-6 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <Plus size={12} />
                    Добавить пункт
                </button>
            )}

        </div>
    );
}