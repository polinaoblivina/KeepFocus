import { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { createSessionConnection } from '../../api/sessionHub';
import { startSession, completeSession, abandonSession } from '../../api/sessions';
import { toggleChecklistItem } from '../../api/boards';
import { getErrorMessage } from '../../api/client';
import type { SessionDto, CardDto, SessionState } from '../../api/types';
import { Timer } from 'lucide-react';
import TimerSetup from './TimerSetup';
import TimerRunning from './TimerRunning';
import TimerTimedOut from './TimerTimedOut';
import CardPanel from './CardPanel';

interface FocusTimerModalProps {
    cardId: string | null;
    card: CardDto | null;
    boardId: string | null;
    onClose: () => void;
    onCardUpdate: (card: CardDto) => void;
}

function playCompletionSound() {
    try {
        const ctx = new AudioContext();
        [523, 659, 784].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            const t = ctx.currentTime + i * 0.22;
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            osc.start(t);
            osc.stop(t + 0.45);
        });
    } catch {
        // ignore bebebe
    }
}

async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

function showCompletionNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    new Notification('🎉 Сессия завершена!', {
        body: 'Время вышло. Отличная работа!',
        silent: true,
    });
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
    const [userContinued, setUserContinued] = useState(false);

    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const timerRef = useRef<number | null>(null);
    const tabStartRef = useRef<number>(0);
    const sessionRef = useRef<SessionDto | null>(null);
    const autoCompletedRef = useRef(false); 

    useEffect(() => { tabStartRef.current = Date.now(); }, []);
    useEffect(() => { sessionRef.current = session; }, [session]);

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

    const isTimedOut =
        session !== null &&
        step === 'running' &&
        !userContinued &&
        status === 'Active' &&
        elapsed >= session.plannedDurationSeconds;

    useEffect(() => {
        if (!isTimedOut || !session || autoCompletedRef.current) return;
        stopTimer();
        playCompletionSound();

        if (document.hidden)
            showCompletionNotification();

        completeSession(session.id)
            .then(() => {
                autoCompletedRef.current = true;
                connectionRef.current?.stop();
            })
            .catch(err => setError(getErrorMessage(err)));
    }, [isTimedOut, session, stopTimer]);


    useEffect(() => {
        if (step !== 'running') return;

        function handleVisibilityChange() {
            const conn = connectionRef.current;
            const current = sessionRef.current;
            if (!conn || !current) return;

            if (document.hidden) {
                if (conn.state === signalR.HubConnectionState.Connected) {
                    const secs = Math.floor((Date.now() - tabStartRef.current) / 1000);
                    tabStartRef.current = Date.now();
                    conn.invoke('TabHidden', current.id, secs).catch(console.error);
                }
            } else {
                if (conn.state === signalR.HubConnectionState.Connected) {
                    const secs = Math.floor((Date.now() - tabStartRef.current) / 1000);
                    tabStartRef.current = Date.now();
                    conn.invoke('TabVisible', current.id, secs).catch(console.error);
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [step]);

    useEffect(() => {
        return () => { stopTimer(); connectionRef.current?.stop(); };
    }, [stopTimer]);

    async function handleStart() {
        setStarting(true); setError(null);
        await requestNotificationPermission();
        try {
            const dto = await startSession(mode, type, type === 'Custom' ? customMins * 60 : undefined, cardId ?? undefined);
            setSession(dto);
            setStep('running');
            setUserContinued(false);
            autoCompletedRef.current = false;
            tabStartRef.current = Date.now();
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
        if (autoCompletedRef.current) {
            onClose();
            return;
        }
        stopTimer();
        try {
            await completeSession(session.id);
            connectionRef.current?.stop();
            onClose();
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleAbandon() {
        if (!session) return;
        stopTimer();
        try {
            await abandonSession(session.id);
            connectionRef.current?.stop();
            onClose();
        } catch (err) { setError(getErrorMessage(err)); }
    }

    async function handleNewSession() {
        if (session && !autoCompletedRef.current) {
            stopTimer();
            try {
                await completeSession(session.id);
            } catch {
                //skip
            }
        }
        connectionRef.current?.stop();
        setSession(null);
        setElapsed(0);
        setStatus('Active');
        setUserContinued(false);
        autoCompletedRef.current = false;
        setStep('setup');
    }

    async function handleToggleItem(checklistId: string, itemId: string, currentChecked: boolean) {
        if (!boardId || !localCard) return;
        const updatedCard: CardDto = {
            ...localCard,
            checklists: localCard.checklists.map(cl =>
                cl.id === checklistId
                    ? {
                        ...cl,
                        completedCount: currentChecked ? cl.completedCount - 1 : cl.completedCount + 1,
                        items: cl.items.map(i => i.id === itemId ? { ...i, isChecked: !currentChecked } : i)
                    }
                    : cl
            )
        };
        setLocalCard(updatedCard); onCardUpdate(updatedCard);
        try { await toggleChecklistItem(boardId, localCard.id, checklistId, itemId); }
        catch { setLocalCard(localCard); onCardUpdate(localCard); }
    }

    const showSetup = step === 'setup';
    const showTimedOut = isTimedOut;
    const showRunning = !showTimedOut && step === 'running' && session !== null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
            <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex max-h-[90vh] ${localCard ? 'w-full max-w-3xl' : 'w-full max-w-sm'}`}>

                <div className="flex-1 flex flex-col">

                    <div className="flex items-center justify-between px-6 pt-6 pb-2">
                        <div className="flex items-center gap-2 text-gray-900">
                            <Timer size={18} />
                            <span className="font-semibold">Фокус-сессия</span>
                        </div>
                        {showSetup && (
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none">✕</button>
                        )}
                    </div>

                    {error && (
                        <div className="mx-6 mt-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">{error}</div>
                    )}

                    {showSetup && <TimerSetup mode={mode} type={type} customMins={customMins} starting={starting} onModeChange={setMode} onTypeChange={setType} onCustomMinsChange={setCustomMins} onStart={handleStart} />}
                    {showTimedOut && <TimerTimedOut onComplete={handleComplete} onNewSession={handleNewSession} />}
                    {showRunning && <TimerRunning session={session!} elapsed={elapsed} status={status} onPauseResume={handlePauseResume} onComplete={handleComplete} onAbandon={handleAbandon} />}

                </div>

                {localCard && <CardPanel card={localCard} onToggleItem={handleToggleItem} />}
            </div>
        </div>
    );
}