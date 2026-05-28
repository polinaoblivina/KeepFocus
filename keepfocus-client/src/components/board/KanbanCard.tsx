import { Timer, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CardDto } from '../../api/types';

interface KanbanCardProps {
    card: CardDto;
    listId: string;
    onDelete: (listId: string, cardId: string) => void;
    onStartSession: (cardId: string) => void;
}
export default function KanbanCard({ card, listId, onDelete, onStartSession }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: card.id,});
    const style = {transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1,};
    const completedItems = card.checklists.reduce((sum, cl) => sum + cl.completedCount, 0);
    const totalItems = card.checklists.reduce((sum, cl) => sum + cl.totalCount, 0);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
        >
            <p className="text-sm text-gray-900 font-medium">{card.title}</p>

            {card.dueDate && (
                <p className="text-xs text-gray-400 mt-1">
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
                    onClick={() => onStartSession(card.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
                >
                    <Timer size={11} />
                    Фокус
                </button>
                <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => onDelete(listId, card.id)}
                    className="ml-auto p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}