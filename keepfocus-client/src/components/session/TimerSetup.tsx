import { Play } from 'lucide-react';

interface TimerSetupProps {
    mode: 'Soft' | 'Hard';
    type: 'Pomodoro' | 'Custom';
    customMins: number;
    starting: boolean;
    onModeChange: (mode: 'Soft' | 'Hard') => void;
    onTypeChange: (type: 'Pomodoro' | 'Custom') => void;
    onCustomMinsChange: (mins: number) => void;
    onStart: () => void;
}

export default function TimerSetup({ mode, type, customMins, starting, onModeChange, onTypeChange, onCustomMinsChange, onStart }: TimerSetupProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 gap-6">

            <div className="w-full">
                <p className="text-xs font-medium text-gray-500 mb-2">Режим фокуса</p>
                <div className="flex gap-2">
                    {(['Soft', 'Hard'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => onModeChange(m)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {m === 'Soft' ? 'Soft' : 'Hard'}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                    {mode === 'Soft'
                        ? 'Таймер идёт даже если уйти со вкладки'
                        : 'Таймер останавливается при уходе со вкладки'}
                </p>
            </div>

            <div className="w-full">
                <p className="text-xs font-medium text-gray-500 mb-2">Длительность</p>
                <div className="flex gap-2 mb-3">
                    {(['Pomodoro', 'Custom'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => onTypeChange(t)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === t
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {t === 'Pomodoro' ? '25 мин' : 'Своя'}
                        </button>
                    ))}
                </div>
                {type === 'Custom' && (
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={1}
                            max={120}
                            value={customMins}
                            onChange={e => onCustomMinsChange(Number(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-sm font-mono w-16 text-center text-gray-700">
                            {customMins} мин
                        </span>
                    </div>
                )}
            </div>

            <button
                onClick={onStart}
                disabled={starting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
                <Play size={16} />
                {starting ? 'Запускаем...' : 'Начать сессию'}
            </button>

        </div>
    );
}