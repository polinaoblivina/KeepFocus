import { Play, Pause, CheckSquare, Square } from 'lucide-react';
import ProgressRing from '../ui/ProgressRing';
import type { SessionDto } from '../../api/types';

interface TimerRunningProps {
    session: SessionDto;
    elapsed: number;
    status: 'Active' | 'Paused';
    onPauseResume: () => void;
    onComplete: () => void;
    onAbandon: () => void;
}

export default function TimerRunning({
    session, elapsed, status, onPauseResume, onComplete, onAbandon
}: TimerRunningProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 gap-6">

            <ProgressRing
                elapsed={elapsed}
                planned={session.plannedDurationSeconds}
                status={status}
            />

            <p className="text-xs text-gray-400">
                {session.type === 'Pomodoro' ? '🍅 Pomodoro' : `⚙️ ${Math.floor(session.plannedDurationSeconds / 60)} мин`}
                {' · '}
                {session.mode === 'Soft' ? '🌊 Soft' : '🔥 Hard'}
            </p>

            <div className="flex gap-3 w-full">
                <button
                    onClick={onPauseResume}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${status === 'Active'
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                >
                    {status === 'Active'
                        ? <><Pause size={15} /> Пауза</>
                        : <><Play size={15} /> Продолжить</>
                    }
                </button>

                <button
                    onClick={onComplete}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors"
                >
                    <CheckSquare size={15} />
                    Завершить
                </button>

                <button
                    onClick={onAbandon}
                    className="flex items-center justify-center p-2.5 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                >
                    <Square size={15} />
                </button>
            </div>

        </div>
    );
}