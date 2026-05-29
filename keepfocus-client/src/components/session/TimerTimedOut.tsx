import { CheckSquare } from 'lucide-react';

interface TimerTimedOutProps {
    onComplete: () => void;
    onNewSession: () => void;
}

export default function TimerTimedOut({ onComplete, onNewSession }: TimerTimedOutProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 gap-6">

            <div className="text-6xl">🎉</div>

            <div className="text-center">
                <p className="text-xl font-bold text-gray-900 mb-2">Время вышло!</p>
                <p className="text-sm text-gray-500">Сессия завершена. Отличная работа!</p>
            </div>

            <button
                onClick={onComplete}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
            >
                <CheckSquare size={16} />
                Завершить
            </button>

            <button
                onClick={onNewSession}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
                Начать ещё одну сессию
            </button>

        </div>
    );
}