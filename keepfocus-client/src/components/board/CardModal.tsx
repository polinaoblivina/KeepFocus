import { useState } from 'react';
import { updateCard, addChecklist, updateChecklist, removeChecklist, addChecklistItem, updateChecklistItem, removeChecklistItem, toggleChecklistItem } from '../../api/boards';
import { getErrorMessage } from '../../api/client';
import type { CardDto } from '../../api/types';
import { X, CheckSquare, Calendar, AlignLeft } from 'lucide-react';
import ChecklistBlock from './ChecklistBlock';

interface CardModalProps {
    card: CardDto;
    boardId: string;
    onClose: () => void;
    onUpdate: (card: CardDto) => void;
}

export default function CardModal({ card, boardId, onClose, onUpdate }: CardModalProps) {
    const [local, setLocal] = useState<CardDto>(card);
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDesc, setEditingDesc] = useState(false);
    const [title, setTitle] = useState(card.title);
    const [desc, setDesc] = useState(card.description ?? '');
    const [dueDate, setDueDate] = useState(card.dueDate ?? '');
    const [error, setError] = useState<string | null>(null);
    const [addingChecklist, setAddingChecklist] = useState(false);
    const [newChecklistTitle, setNewChecklistTitle] = useState('');

    function updateLocal(updated: CardDto) {
        setLocal(updated);
        onUpdate(updated);
    }

    async function saveTitle() {
        setEditingTitle(false);
        if (!title.trim() || title === local.title) return;
        try {
            await updateCard(boardId, local.id, title.trim(), local.description ?? undefined, local.dueDate ?? undefined);
            updateLocal({ ...local, title: title.trim() });
        } catch (err) { setError(getErrorMessage(err)); setTitle(local.title); }
    }

    async function saveDesc() {
        setEditingDesc(false);
        if (desc === (local.description ?? '')) return;
        try {
            await updateCard(boardId, local.id, local.title, desc.trim() || undefined, local.dueDate ?? undefined);
            updateLocal({ ...local, description: desc.trim() || null });
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function saveDueDate(value: string) {
        setDueDate(value);
        try {
            await updateCard(boardId, local.id, local.title, local.description ?? undefined, value || undefined);
            updateLocal({ ...local, dueDate: value || null });
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleAddChecklist(e: React.FormEvent) {
        e.preventDefault();
        if (!newChecklistTitle.trim()) return;
        try {
            const cl = await addChecklist(boardId, local.id, newChecklistTitle.trim());
            updateLocal({ ...local, checklists: [...local.checklists, cl] });
            setNewChecklistTitle('');
            setAddingChecklist(false);
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleRenameChecklist(checklistId: string, newTitle: string) {
        try {
            await updateChecklist(boardId, local.id, checklistId, newTitle);
            updateLocal({ ...local, checklists: local.checklists.map(cl => cl.id === checklistId ? { ...cl, title: newTitle } : cl) });
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleRemoveChecklist(checklistId: string) {
        try {
            await removeChecklist(boardId, local.id, checklistId);
            updateLocal({ ...local, checklists: local.checklists.filter(cl => cl.id !== checklistId) });
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleAddItem(checklistId: string, content: string) {
        try {
            const item = await addChecklistItem(boardId, local.id, checklistId, content);
            updateLocal({
                ...local, checklists: local.checklists.map(cl =>
                    cl.id === checklistId ? { ...cl, items: [...cl.items, item], totalCount: cl.totalCount + 1 } : cl
                )
            });
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleToggleItem(checklistId: string, itemId: string, currentChecked: boolean) {
        try {
            await toggleChecklistItem(boardId, local.id, checklistId, itemId);
            updateLocal({
                ...local, checklists: local.checklists.map(cl =>
                    cl.id === checklistId
                        ? {
                            ...cl,
                            completedCount: currentChecked ? cl.completedCount - 1 : cl.completedCount + 1,
                            items: cl.items.map(i => i.id === itemId ? { ...i, isChecked: !currentChecked } : i)
                        }
                        : cl
                )
            });
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleUpdateItem(checklistId: string, itemId: string, content: string) {
        try {
            await updateChecklistItem(boardId, local.id, checklistId, itemId, content);
            updateLocal({
                ...local, checklists: local.checklists.map(cl =>
                    cl.id === checklistId
                        ? { ...cl, items: cl.items.map(i => i.id === itemId ? { ...i, content } : i) }
                        : cl
                )
            });
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleRemoveItem(checklistId: string, itemId: string, isChecked: boolean) {
        try {
            await removeChecklistItem(boardId, local.id, checklistId, itemId);
            updateLocal({
                ...local, checklists: local.checklists.map(cl =>
                    cl.id === checklistId
                        ? {
                            ...cl,
                            totalCount: cl.totalCount - 1,
                            completedCount: isChecked ? cl.completedCount - 1 : cl.completedCount,
                            items: cl.items.filter(i => i.id !== itemId)
                        }
                        : cl
                )
            });
        } catch (err) { setError(getErrorMessage(err)); }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
            <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

                <div className="flex items-start justify-between p-6 pb-0">
                    <div className="flex-1 mr-4">
                        {editingTitle ? (
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                                onBlur={saveTitle} onKeyDown={e => e.key === 'Enter' && saveTitle()} autoFocus
                                className="w-full text-xl font-bold text-gray-900 bg-white border border-blue-400 rounded-lg px-3 py-1.5 focus:outline-none" />
                        ) : (
                            <h2 className="text-xl font-bold text-gray-900 cursor-pointer hover:bg-white rounded-lg px-3 py-1.5 -ml-3" onClick={() => setEditingTitle(true)}>
                                {local.title}
                            </h2>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="mx-6 mt-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">{error}</div>}

                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Дедлайн</span>
                        </div>
                        <input type="date" value={dueDate} onChange={e => saveDueDate(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {dueDate && (
                            <button onClick={() => saveDueDate('')} className="ml-2 text-xs text-gray-400 hover:text-red-500 transition-colors">Убрать</button>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <AlignLeft size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Описание</span>
                        </div>
                        {editingDesc ? (
                            <div>
                                <textarea value={desc} onChange={e => setDesc(e.target.value)} autoFocus rows={4}
                                    placeholder="Добавьте описание..."
                                    className="w-full px-3 py-2 bg-white border border-blue-400 rounded-lg text-sm focus:outline-none resize-none" />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={saveDesc} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors">Сохранить</button>
                                    <button onClick={() => { setEditingDesc(false); setDesc(local.description ?? ''); }} className="px-3 py-1.5 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition-colors">Отмена</button>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => setEditingDesc(true)} className="min-h-[60px] px-3 py-2 bg-white rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
                                {local.description || <span className="text-gray-400">Добавьте описание...</span>}
                            </div>
                        )}
                    </div>

                    {local.checklists.map(cl => (
                        <ChecklistBlock
                            key={cl.id}
                            checklist={cl}
                            onRename={t => handleRenameChecklist(cl.id, t)}
                            onRemove={() => handleRemoveChecklist(cl.id)}
                            onAddItem={content => handleAddItem(cl.id, content)}
                            onToggle={(itemId, checked) => handleToggleItem(cl.id, itemId, checked)}
                            onUpdateItem={(itemId, content) => handleUpdateItem(cl.id, itemId, content)}
                            onRemoveItem={(itemId, checked) => handleRemoveItem(cl.id, itemId, checked)}
                        />
                    ))}

                    {addingChecklist ? (
                        <form onSubmit={handleAddChecklist} className="flex gap-2">
                            <input type="text" value={newChecklistTitle} onChange={e => setNewChecklistTitle(e.target.value)}
                                placeholder="Название чеклиста..." autoFocus
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Добавить</button>
                            <button type="button" onClick={() => { setAddingChecklist(false); setNewChecklistTitle(''); }}
                                className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">Отмена</button>
                        </form>
                    ) : (
                        <button onClick={() => setAddingChecklist(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 transition-colors">
                            <CheckSquare size={14} />
                            Добавить чеклист
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
}