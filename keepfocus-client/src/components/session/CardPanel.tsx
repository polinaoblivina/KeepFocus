import type { CardDto } from '../../api/types';

interface CardPanelProps {
    card: CardDto;
    onToggleItem: (checklistId: string, itemId: string, currentChecked: boolean) => void;
}

export default function CardPanel({ card, onToggleItem }: CardPanelProps) {
    return (
        <div className="w-72 border-l border-gray-100 bg-gray-50 flex flex-col overflow-hidden">
            <div className="p-5 flex-1 overflow-y-auto">

                <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>

                {card.description && (
                    <p className="text-sm text-gray-500 mb-4">{card.description}</p>
                )}

                {card.dueDate && (
                    <p className="text-xs text-gray-400 mb-4">
                        📅 До: {new Date(card.dueDate).toLocaleDateString('ru')}
                    </p>
                )}

                {card.checklists.map(cl => (
                    <div key={cl.id} className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-600">{cl.title}</p>
                            <span className="text-xs text-gray-400">{cl.completedCount}/{cl.totalCount}</span>
                        </div>

                        {cl.totalCount > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                                <div
                                    className="bg-green-500 h-1 rounded-full transition-all"
                                    style={{ width: `${(cl.completedCount / cl.totalCount) * 100}%` }}
                                />
                            </div>
                        )}

                        {cl.items
                            .sort((a, b) => a.position - b.position)
                            .map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onToggleItem(cl.id, item.id, item.isChecked)}
                                    className="w-full flex items-start gap-2.5 py-1.5 text-left hover:bg-gray-100 rounded-lg px-1 transition-colors"
                                >
                                    <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${item.isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                        }`}>
                                        {item.isChecked && (
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <path d="M2 6l3 3 5-5" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-xs leading-relaxed ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {item.content}
                                    </span>
                                </button>
                            ))
                        }
                    </div>
                ))}

            </div>
        </div>
    );
}