import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBoard, addList, renameList, deleteList, reorderLists, addCard, deleteCard, moveCard } from '../api/boards';
import { getErrorMessage } from '../api/client';
import type { BoardDto, CardDto, ListDto } from '../api/types';
import { ArrowLeft, Plus, Timer } from 'lucide-react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners, KeyboardSensor} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import KanbanList from '../components/board/KanbanList';
import FocusTimerModal from '../components/session/FocusTimerModal';

export default function BoardPage() {
    const [board, setBoard] = useState<BoardDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addingList, setAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const [sessionCardId, setSessionCardId] = useState<string | null>(null);
    const [showTimer, setShowTimer] = useState(false);
    const [activeCard, setActiveCard] = useState<CardDto | null>(null);
    const [activeList, setActiveList] = useState<ListDto | null>(null);

    const originalBoardRef = useRef<BoardDto | null>(null);
    const crossListTargetRef = useRef<string | null>(null);

    const { boardId } = useParams<{ boardId: string }>();
    const navigate = useNavigate();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        async function loadBoard() {
            try {
                const data = await getBoard(boardId!);
                setBoard(data);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }
        if (boardId) loadBoard();
    }, [boardId]);

    async function handleAddList(e: React.FormEvent) {
        e.preventDefault();
        if (!newListTitle.trim() || !boardId) return;
        try {
            const list = await addList(boardId, newListTitle.trim());
            setBoard(prev => prev ? { ...prev, lists: [...prev.lists, { ...list, cards: [] }] } : prev);
            setNewListTitle(''); setAddingList(false);
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleDeleteList(listId: string) {
        if (!boardId) return;
        try {
            await deleteList(boardId, listId);
            setBoard(prev => prev ? { ...prev, lists: prev.lists.filter(l => l.id !== listId) } : prev);
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleRenameList(listId: string, title: string) {
        if (!boardId) return;
        try { await renameList(boardId, listId, title); }
        catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleAddCard(listId: string, title: string) {
        if (!boardId) return;
        try {
            const card = await addCard(boardId, listId, title);
            setBoard(prev => prev ? {
                ...prev,
                lists: prev.lists.map(l => l.id === listId ? { ...l, cards: [...l.cards, card] } : l)
            } : prev);
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleDeleteCard(listId: string, cardId: string) {
        if (!boardId) return;
        try {
            await deleteCard(boardId, listId, cardId);
            setBoard(prev => prev ? {
                ...prev,
                lists: prev.lists.map(l => l.id === listId ? { ...l, cards: l.cards.filter(c => c.id !== cardId) } : l)
            } : prev);
        } catch (err) { setError(getErrorMessage(err)); }
    }

    function handleCardUpdate(updatedCard: CardDto) {
        setBoard(prev => prev ? {
            ...prev,
            lists: prev.lists.map(l => ({
                ...l,
                cards: l.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
            }))
        } : prev);
    }

    function handleDragStart(event: DragStartEvent) {
        const id = event.active.id as string;
        originalBoardRef.current = board;
        crossListTargetRef.current = null; 

        const list = board?.lists.find(l => l.id === id);
        if (list) { setActiveList(list); setActiveCard(null); return; }

        const card = board?.lists.flatMap(l => l.cards).find(c => c.id === id);
        if (card) { setActiveCard(card); setActiveList(null); }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over || !board) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (board.lists.some(l => l.id === activeId)) return;

        const sourceList = board.lists.find(l => l.cards.some(c => c.id === activeId));
        if (!sourceList) return;

        const targetList =
            board.lists.find(l => l.id === overId) ||
            board.lists.find(l => l.cards.some(c => c.id === overId));

        if (!targetList || sourceList.id === targetList.id) return;

        crossListTargetRef.current = targetList.id; 

        const card = sourceList.cards.find(c => c.id === activeId)!;
        setBoard(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                lists: prev.lists.map(l => {
                    if (l.id === sourceList.id) return { ...l, cards: l.cards.filter(c => c.id !== activeId) };
                    if (l.id === targetList.id) return { ...l, cards: [...l.cards, { ...card, listId: targetList.id }] };
                    return l;
                })
            };
        });
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveCard(null);
        setActiveList(null);

        if (!boardId) return;

        const activeId = active.id as string;
        const overId = over?.id as string;

        if (!over || activeId === overId) {
            const targetListId = crossListTargetRef.current;
            crossListTargetRef.current = null;

            if (!targetListId) return; 

            const originalBoard = originalBoardRef.current;
            if (!originalBoard) return;

            const originalTargetCards = [...(originalBoard.lists.find(l => l.id === targetListId)?.cards ?? [])]
                .sort((a, b) => a.position - b.position);
            const newPosition = originalTargetCards.length > 0
                ? originalTargetCards[originalTargetCards.length - 1].position + 1000
                : 1000;

            setBoard(prev => prev ? {
                ...prev,
                lists: prev.lists.map(l =>
                    l.id === targetListId ? {
                        ...l,
                        cards: l.cards.map(c => c.id === activeId ? { ...c, position: newPosition } : c)
                    } : l
                )
            } : prev);

            try {
                await moveCard(boardId, activeId, targetListId, newPosition);
            } catch (err) {
                setError(getErrorMessage(err));
                try { const data = await getBoard(boardId); setBoard(data); } catch { /**/ }
            }
            return;
        }

        crossListTargetRef.current = null;

        if (!board) return;

        const isListDrag = board.lists.some(l => l.id === activeId);
        if (isListDrag) {
            const overListId =
                board.lists.find(l => l.id === overId)?.id ||
                board.lists.find(l => l.cards.some(c => c.id === overId))?.id;

            if (!overListId || overListId === activeId) return;

            const sortedLists = [...board.lists].sort((a, b) => a.position - b.position);
            const oldIndex = sortedLists.findIndex(l => l.id === activeId);
            const newIndex = sortedLists.findIndex(l => l.id === overListId);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(sortedLists, oldIndex, newIndex);
            const withPositions = reordered.map((l, i) => ({ ...l, position: (i + 1) * 1000 }));
            setBoard(prev => prev ? { ...prev, lists: withPositions } : prev);

            try {
                await reorderLists(boardId, withPositions.map(l => ({ listId: l.id, position: l.position })));
            } catch (err) {
                setError(getErrorMessage(err));
                try { const data = await getBoard(boardId); setBoard(data); } catch { /**/ }
            }
            return;
        }

        const originalBoard = originalBoardRef.current;
        if (!originalBoard) return;

        const originalSourceList = originalBoard.lists.find(l => l.cards.some(c => c.id === activeId));
        if (!originalSourceList) return;

        const originalTargetList =
            originalBoard.lists.find(l => l.id === overId) ||
            originalBoard.lists.find(l => l.cards.some(c => c.id === overId));

        const isSameList = !originalTargetList || originalTargetList.id === originalSourceList.id;

        if (isSameList) {
            const originalCards = [...originalSourceList.cards].sort((a, b) => a.position - b.position);
            const oldIndex = originalCards.findIndex(c => c.id === activeId);
            const newIndex = originalCards.findIndex(c => c.id === overId);

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

            const reordered = arrayMove(originalCards, oldIndex, newIndex);
            const movedIdx = newIndex;
            const prevCard = reordered[movedIdx - 1];
            const nextCard = reordered[movedIdx + 1];

            let newPosition: number;
            if (!prevCard && !nextCard) newPosition = 1000;
            else if (!prevCard) newPosition = Math.floor(nextCard.position / 2);
            else if (!nextCard) newPosition = prevCard.position + 1000;
            else newPosition = Math.floor((prevCard.position + nextCard.position) / 2);
            if (newPosition <= 0) newPosition = (reordered.length + 1) * 1000;

            setBoard(prev => prev ? {
                ...prev,
                lists: prev.lists.map(l =>
                    l.id === originalSourceList.id ? {
                        ...l,
                        cards: reordered.map(c => c.id === activeId ? { ...c, position: newPosition } : c)
                    } : l
                )
            } : prev);

            try {
                await moveCard(boardId, activeId, originalSourceList.id, newPosition);
            } catch (err) {
                setError(getErrorMessage(err));
                try { const data = await getBoard(boardId); setBoard(data); } catch { /**/ }
            }
            return;
        }

        const targetListId = originalTargetList!.id;
        const targetCards = [...(originalTargetList?.cards ?? [])].sort((a, b) => a.position - b.position);
        const overIndex = targetCards.findIndex(c => c.id === overId);

        let newPosition: number;
        if (targetCards.length === 0) newPosition = 1000;
        else if (overIndex === -1) newPosition = targetCards[targetCards.length - 1].position + 1000;
        else if (overIndex === 0) newPosition = Math.floor(targetCards[0].position / 2);
        else newPosition = Math.floor((targetCards[overIndex - 1].position + targetCards[overIndex].position) / 2);
        if (newPosition <= 0) newPosition = (targetCards.length + 1) * 1000;

        setBoard(prev => prev ? {
            ...prev,
            lists: prev.lists.map(l =>
                l.id === targetListId ? {
                    ...l,
                    cards: l.cards.map(c => c.id === activeId ? { ...c, position: newPosition } : c)
                } : l
            )
        } : prev);

        try {
            await moveCard(boardId, activeId, targetListId, newPosition);
        } catch (err) {
            setError(getErrorMessage(err));
            try { const data = await getBoard(boardId); setBoard(data); } catch { /**/ }
        }
    }

    function handleStartSession(cardId: string | null) {
        setSessionCardId(cardId);
        setShowTimer(true);
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Загрузка доски...</p>
        </div>
    );

    if (error || !board) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-500 mb-4">{error || 'Доска не найдена'}</p>
                <Link to="/boards" className="text-blue-600 hover:underline">← Назад к доскам</Link>
            </div>
        </div>
    );

    const sessionCard = sessionCardId
        ? board.lists.flatMap(l => l.cards).find(c => c.id === sessionCardId) ?? null
        : null;

    const sortedLists = [...board.lists].sort((a, b) => a.position - b.position);
    const listIds = sortedLists.map(l => l.id);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            <header className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/boards')} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">{board.title}</h1>
                    </div>
                    <button
                        onClick={() => handleStartSession(null)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Timer size={15} />
                        Фокус-сессия
                    </button>
                </div>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
                    <div className="flex-1 overflow-x-auto p-6">
                        <div className="flex gap-4 h-full items-start">

                            {sortedLists.map(list => (
                                <KanbanList
                                    key={list.id}
                                    list={list}
                                    boardId={boardId!}
                                    onAddCard={handleAddCard}
                                    onDeleteCard={handleDeleteCard}
                                    onUpdateCard={handleCardUpdate}
                                    onDeleteList={handleDeleteList}
                                    onRenameList={handleRenameList}
                                    onStartSession={handleStartSession}
                                />
                            ))}

                            <div className="flex-shrink-0 w-72">
                                {addingList ? (
                                    <form onSubmit={handleAddList} className="bg-white rounded-xl p-3 shadow-sm">
                                        <input
                                            type="text" value={newListTitle}
                                            onChange={e => setNewListTitle(e.target.value)}
                                            placeholder="Название списка" autoFocus
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Добавить</button>
                                            <button type="button" onClick={() => { setAddingList(false); setNewListTitle(''); }} className="flex-1 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">Отмена</button>
                                        </div>
                                    </form>
                                ) : (
                                    <button onClick={() => setAddingList(true)} className="w-full flex items-center gap-2 px-4 py-3 bg-white/70 hover:bg-white rounded-xl text-gray-600 hover:text-gray-900 text-sm font-medium transition-all shadow-sm">
                                        <Plus size={16} />
                                        Добавить список
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeCard && (
                        <div className="bg-white rounded-lg p-3 shadow-xl rotate-2 opacity-90 w-72">
                            <p className="text-sm text-gray-900 font-medium">{activeCard.title}</p>
                        </div>
                    )}
                    {activeList && (
                        <div className="bg-gray-200 rounded-xl p-3 shadow-xl opacity-90 w-72">
                            <p className="text-sm font-semibold text-gray-800">{activeList.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{activeList.cards.length} карточек</p>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {showTimer && (
                <FocusTimerModal
                    cardId={sessionCardId}
                    card={sessionCard}
                    boardId={boardId ?? null}
                    onClose={() => setShowTimer(false)}
                    onCardUpdate={handleCardUpdate}
                />
            )}

        </div>
    );
}