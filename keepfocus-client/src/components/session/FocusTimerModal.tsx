import { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { createSessionConnection } from '../../api/sessionHub';
import { startSession, completeSession, abandonSession } from '../../api/sessions';
import { toggleChecklistItem } from '../../api/boards';
import { getErrorMessage } from '../../api/client';
import type { SessionDto, CardDto, SessionState } from '../../api/types';
import { X, Timer } from 'lucide-react';
import TimerSetup from './TimerSetup';
import TimerRunning from './TimerRunning';
import CardPanel from './CardPanel';

interface FocusTimerModalProps {
    cardId: string | null;
    card: CardDto | null;
    boardId: string | null;
    onClose: () => void;
    onCardUpdate: (card: CardDto) => void;
}

export default function FocusTimerModal({ cardId, card, boardId, onClose, onCardUpdate }: FocusTimerModalProps) {
    const [step, setStep] = useState<'setup' | 'running'>('setup');
    const [mode, setMode] = useState<'Soft' | 'Hard'>('Soft');
    const [type, setType] = useState<'Pomodoro' | 'Custom'>('Pomodoro');
    const [customMins, setCustomMins] = useState(25);
    const [session, setSession] = useState<SessionDto | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [status, setStatus] = useState<'Active' | 'Paused'>('Active');
    const [localCard, setLocalCard] = useState<CardDto | null>(card);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const timerRef = useRef<number | null>(null);
    const tabStartRef = useRef<number>(0);

    useEffect(() => { tabStartRef.current = Date.now(); }, []);

    const startTimer = useCallback((from: number) => {
        setElapsed(from);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => setElapsed(prev => prev + 1), 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }, []);

    const connectSignalR = useCallback(async (sessionId: string, initialElapsed: number) => {
        const connection = createSessionConnection(sessionId);
        connectionRef.current = connection;

        connection.on('State', (data: SessionState) => {
            setStatus(data.status as 'Active' | 'Paused');
            setElapsed(data.elapsed);
            if (data.status === 'Active') startTimer(data.elapsed);
            else { stopTimer(); setElapsed(data.elapsed); }
        });

        connection.on('Error', (message: string) => setError(message));
        connection.onclose(() => stopTimer());

        try {
            await connection.start();
            startTimer(initialElapsed);
        } catch {
            setError('Не удалось подключиться к серверу');
        }
    }, [startTimer, stopTimer]);

    useEffect(() => {
        if (step !== 'running' || !connectionRef.current || !session) return;

        function handleVisibilityChange() {
            const conn = connectionRef.current;
            if (!conn || !session) return;
            if (document.hidden) {
                const secs = Math.floor((Date.now() - tabStartRef.current) / 1000);
                tabStartRef.current = Date.now();
                conn.invoke('TabHidden', session.id, secs).catch(console.error);
            } else {
                const secs = Math.floor((Date.now() - tabStartRef.current) / 1000);
                tabStartRef.current = Date.now();
                conn.invoke('TabVisible', session.id, secs).catch(console.error);
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [step, session]);

    useEffect(() => {
        return () => { stopTimer(); connectionRef.current?.stop(); };
    }, [stopTimer]);

    async function handleStart() {
        setStarting(true); setError(null);
        try {
            const dto = await startSession(mode, type, type === 'Custom' ? customMins * 60 : undefined, cardId ?? undefined);
            setSession(dto); setStep('running');
            await connectSignalR(dto.id, dto.elapsedSeconds);
        } catch (err) { setError(getErrorMessage(err)); }
        finally { setStarting(false); }
    }

    async function handlePauseResume() {
        const conn = connectionRef.current;
        if (!conn || !session) return;
        try {
            if (status === 'Active') await conn.invoke('Pause', session.id);
            else await conn.invoke('Resume', session.id);
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleComplete() {
        if (!session) return;
        stopTimer();
        try { await completeSession(session.id); connectionRef.current?.stop(); onClose(); }
        catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleAbandon() {
        if (!session || !confirm('Прервать сессию?')) return;
        stopTimer();
        try { await abandonSession(session.id); connectionRef.current?.stop(); onClose(); }
        catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleToggleItem(checklistId: string, itemId: string, currentChecked: boolean) {
        if (!boardId || !localCard) return;
        const updatedCard: CardDto = {
            ...localCard,
            checklists: localCard.checklists.map(cl =>
                cl.id === checklistId
                    ? {
                        ...cl, completedCount: currentChecked ? cl.completedCount - 1 : cl.completedCount + 1,
                        items: cl.items.map(i => i.id === itemId ? { ...i, isChecked: !currentChecked } : i)
                    }
                    : cl
            )
        };
        setLocalCard(updatedCard); onCardUpdate(updatedCard);
        try { await toggleChecklistItem(boardId, localCard.id, checklistId, itemId); }
        catch { setLocalCard(localCard); onCardUpdate(localCard); }
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
            <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex max-h-[90vh] ${localCard ? 'w-full max-w-3xl' : 'w-full max-w-sm'}`}>

                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between px-6 pt-6 pb-2">
                        <div className="flex items-center gap-2 text-gray-900">
                            <Timer size={18} />
                            <span className="font-semibold">Фокус-сессия</span>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="mx-6 mt-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">{error}</div>
                    )}

                    {step === 'setup' && (
                        <TimerSetup
                            mode={mode} type={type} customMins={customMins} starting={starting}
                            onModeChange={setMode} onTypeChange={setType}
                            onCustomMinsChange={setCustomMins} onStart={handleStart}
                        />
                    )}

                    {step === 'running' && session && (
                        <TimerRunning
                            session={session} elapsed={elapsed} status={status}
                            onPauseResume={handlePauseResume}
                            onComplete={handleComplete}
                            onAbandon={handleAbandon}
                        />
                    )}
                </div>

                {localCard && <CardPanel card={localCard} onToggleItem={handleToggleItem} />}
            </div>
        </div>
    );
}