import { useState, useCallback } from 'react';

const keyFor = (id: string) => `kf-board-bg:${id}`;

function readBg(boardId: string | null): string | null {
    if (!boardId) return null;
    try { return localStorage.getItem(keyFor(boardId)); }
    catch { return null; }
}

export function useBoardBackground(boardId: string | null) {
    const [loadedFor, setLoadedFor] = useState(boardId);
    const [bg, setBgState] = useState<string | null>(() => readBg(boardId));

    if (boardId !== loadedFor) {
        setLoadedFor(boardId);
        setBgState(readBg(boardId));
    }

    const setBg = useCallback((value: string | null) => {
        setBgState(value);
        if (!boardId) return;
        try {
            if (value) localStorage.setItem(keyFor(boardId), value);
            else localStorage.removeItem(keyFor(boardId));
        } catch { /**/ }
    }, [boardId]);

    return { bg, setBg };
}