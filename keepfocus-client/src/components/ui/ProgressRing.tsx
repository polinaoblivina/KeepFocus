interface ProgressRingProps {
    elapsed: number;
    planned: number;
    status: 'Active' | 'Paused';
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ProgressRing({ elapsed, planned, status }: ProgressRingProps) {
    const progress = Math.min(elapsed / planned, 1);
    const circumference = 2 * Math.PI * 54;

    return (
        <div className="relative">
            <svg width="140" height="140" className="-rotate-90">
                <circle cx="70" cy="70" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle
                    cx="70" cy="70" r="54"
                    fill="none"
                    stroke={status === 'Active' ? '#3b82f6' : '#f59e0b'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    className="transition-all duration-1000"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-gray-900">
                    {formatTime(elapsed)}
                </span>
                <span className={`text-xs mt-1 font-medium ${status === 'Active' ? 'text-blue-500' : 'text-amber-500'}`}>
                    {status === 'Active' ? 'Фокус' : 'Пауза'}
                </span>
            </div>
        </div>
    );
}