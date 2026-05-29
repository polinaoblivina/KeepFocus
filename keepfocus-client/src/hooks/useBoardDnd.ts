import { useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { getBoard, reorderLists, moveCard } from '../api/boards';
import { getErrorMessage } from '../api/client';
import type { BoardDto, CardDto, ListDto } from '../api/types';

interface UseBoardDndProps {
    board: BoardDto | null;
    boardId: string;
    setBoard: React.Dispatch<React.SetStateAction<BoardDto | null>>;
    setError: (msg: string) => void;
    setActiveCard: (card: CardDto | null) => void;
    setActiveList: (list: ListDto | null) => void;
}

export function useBoardDnd({ board, boardId, setBoard, setError, setActiveCard, setActiveList }: UseBoardDndProps) {
    const originalBoardRef = useRef<BoardDto | null>(null);
    const crossListTargetRef = useRef<string | null>(null);

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

        const activeId = active.id as string;
        const overId = over?.id as string;

        if (!over || activeId === overId) {
            const targetListId = crossListTargetRef.current;
            crossListTargetRef.current = null;
            if (!targetListId) return;

            const originalBoard = originalBoardRef.current;
            if (!originalBoard) return;

            const originalTargetCards = [...(originalBoard.lists.find(l => l.id === targetListId)?.cards ?? [])].sort((a, b) => a.position - b.position);
            const newPosition = originalTargetCards.length > 0 ? originalTargetCards[originalTargetCards.length - 1].position + 1000 : 1000;

            setBoard(prev => prev ? {
                ...prev,
                lists: prev.lists.map(l =>
                    l.id === targetListId
                        ? { ...l, cards: l.cards.map(c => c.id === activeId ? { ...c, position: newPosition } : c) }
                        : l
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
        const originalTargetList = originalBoard.lists.find(l => l.id === overId) || originalBoard.lists.find(l => l.cards.some(c => c.id === overId));

        const isSameList = !originalTargetList || originalTargetList.id === originalSourceList.id;

        if (isSameList) {
            const originalCards = [...originalSourceList.cards].sort((a, b) => a.position - b.position);
            const oldIndex = originalCards.findIndex(c => c.id === activeId);
            const newIndex = originalCards.findIndex(c => c.id === overId);

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

            const reordered = arrayMove(originalCards, oldIndex, newIndex);
            const prevCard = reordered[newIndex - 1];
            const nextCard = reordered[newIndex + 1];

            let newPosition: number;
            if (!prevCard && !nextCard) newPosition = 1000;
            else if (!prevCard) newPosition = Math.floor(nextCard.position / 2);
            else if (!nextCard) newPosition = prevCard.position + 1000;
            else newPosition = Math.floor((prevCard.position + nextCard.position) / 2);
            if (newPosition <= 0) newPosition = (reordered.length + 1) * 1000;

            setBoard(prev => prev ? {
                ...prev,
                lists: prev.lists.map(l =>
                    l.id === originalSourceList.id
                        ? { ...l, cards: reordered.map(c => c.id === activeId ? { ...c, position: newPosition } : c) }
                        : l
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
                l.id === targetListId
                    ? { ...l, cards: l.cards.map(c => c.id === activeId ? { ...c, position: newPosition } : c) }
                    : l
            )
        } : prev);

        try {
            await moveCard(boardId, activeId, targetListId, newPosition);
        } catch (err) {
            setError(getErrorMessage(err));
            try { const data = await getBoard(boardId); setBoard(data); } catch { /**/ }
        }
    }

    return { handleDragStart, handleDragOver, handleDragEnd };
}