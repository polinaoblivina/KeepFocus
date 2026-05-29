import { useState } from 'react';
import { Timer, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CardDto } from '../../api/types';
import CardModal from './CardModal';
import ConfirmModal from '../ui/ConfirmModal';

interface KanbanCardProps {
    card: CardDto;
    listId: string;
    boardId: string;
    onDelete: (listId: string, cardId: string) => void;
    onUpdate: (card: CardDto) => void;
    onStartSession: (cardId: string) => void;
}

export default function KanbanCard({ card, listId, boardId, onDelete, onUpdate, onStartSession }: KanbanCardProps) {
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
    const style = {transform: CSS.Transform.toString(transform),transition,opacity: isDragging ? 0.4 : 1,};

    const completedItems = card.checklists.reduce((sum, cl) => sum + cl.completedCount, 0);
    const totalItems = card.checklists.reduce((sum, cl) => sum + cl.totalCount, 0);

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => setShowModal(true)}
                className="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
                <p className="text-sm text-gray-900 font-medium">{card.title}</p>

                {card.dueDate && (
                    <p className={`text-xs mt-1 ${new Date(card.dueDate) < new Date()
                            ? 'text-red-500 font-medium'  
                            : 'text-gray-400'             
                        }`}>
                        До: {new Date(card.dueDate).toLocaleDateString('ru')}
                    </p>
                )}

                {totalItems > 0 && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>Задачи</span>
                            <span>{completedItems}/{totalItems}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${(completedItems / totalItems) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); onStartSession(card.id); }}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
                    >
                        <Timer size={11} />
                        Фокус
                    </button>
                    <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                        className="ml-auto p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {showModal && (
                <CardModal
                    card={card}
                    boardId={boardId}
                    onClose={() => setShowModal(false)}
                    onUpdate={updated => { onUpdate(updated); }}
                />
            )}

            {confirmDelete && (
                <ConfirmModal
                    title="Удалить карточку?"
                    message={`Карточка "${card.title}" будет удалена безвозвратно.`}
                    confirmText="Удалить"
                    danger
                    onConfirm={() => { setConfirmDelete(false); onDelete(listId, card.id); }}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </>
    );
}