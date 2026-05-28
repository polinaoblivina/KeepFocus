import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import type { ListDto } from '../../api/types';

interface KanbanListProps {
    list: ListDto;
    boardId: string;
    onAddCard: (listId: string, title: string) => void;
    onDeleteCard: (listId: string, cardId: string) => void;
    onDeleteList: (listId: string) => void;
    onRenameList: (listId: string, title: string) => void;
    onStartSession: (cardId: string) => void;
}

export default function KanbanList({list, onAddCard, onDeleteCard, onDeleteList, onRenameList, onStartSession}: KanbanListProps) {
    const [addingCard, setAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [title, setTitle] = useState(list.title);

    async function handleAddCard(e: React.FormEvent) {
        e.preventDefault();
        if (!newCardTitle.trim()) return;
        onAddCard(list.id, newCardTitle.trim());
        setNewCardTitle('');
        setAddingCard(false);
    }

    function handleRenameBlur() {
        setEditingTitle(false);
        const trimmed = title.trim();
        if (!trimmed) { setTitle(list.title); return; }
        if (trimmed !== list.title) onRenameList(list.id, trimmed);
    }

    const cardIds = list.cards.map(c => c.id);

    return (
        <div className="flex-shrink-0 w-72 bg-gray-200 rounded-xl flex flex-col max-h-full">

            <div className="flex items-center justify-between px-3 py-2.5">
                {editingTitle ? (
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={handleRenameBlur}
                        onKeyDown={e => e.key === 'Enter' && handleRenameBlur()}
                        autoFocus
                        className="flex-1 px-2 py-1 text-sm font-semibold bg-white rounded border border-blue-400 focus:outline-none"
                    />
                ) : (
                    <h3
                        className="font-semibold text-gray-800 text-sm cursor-pointer hover:text-blue-600 flex-1"
                        onClick={() => setEditingTitle(true)}
                    >
                        {title}
                        <span className="text-gray-400 font-normal ml-1.5">{list.cards.length}</span>
                    </h3>
                )}
                <button
                    onClick={() => onDeleteList(list.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                <div className="px-2 pb-2 space-y-2 overflow-y-auto flex-1">
                    {list.cards
                        .sort((a, b) => a.position - b.position)
                        .map(card => (
                            <KanbanCard
                                key={card.id}
                                card={card}
                                listId={list.id}
                                onDelete={onDeleteCard}
                                onStartSession={onStartSession}
                            />
                        ))
                    }
                </div>
            </SortableContext>

            <div className="px-2 pb-2">
                {addingCard ? (
                    <form onSubmit={handleAddCard}>
                        <textarea
                            value={newCardTitle}
                            onChange={e => setNewCardTitle(e.target.value)}
                            placeholder="Название карточки"
                            autoFocus
                            rows={2}
                            className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors">
                                Добавить
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAddingCard(false); setNewCardTitle(''); }}
                                className="flex-1 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setAddingCard(true)}
                        className="w-full flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-gray-800 hover:bg-gray-300 rounded-lg text-sm transition-colors"
                    >
                        <Plus size={14} />
                        Добавить карточку
                    </button>
                )}
            </div>

        </div>
    );
}