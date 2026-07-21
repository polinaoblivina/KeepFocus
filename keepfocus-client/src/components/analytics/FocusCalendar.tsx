import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKey } from '../../utils/date';

interface FocusCalendarProps {
    year: number;
    month: number; // 0-11
    dailyTotals: Record<string, number>;
    selectedDate: string | null;
    onSelectDate: (date: string) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    canGoPrev: boolean;
    canGoNext: boolean;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function levelClasses(seconds: number): string {
    if (seconds <= 0) return 'bg-gray-100 text-gray-400';
    if (seconds < 30 * 60) return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400';
    if (seconds < 60 * 60) return 'bg-green-300 dark:bg-green-700 text-green-900 dark:text-green-50';
    if (seconds < 2 * 60 * 60) return 'bg-green-500 text-white';
    return 'bg-green-700 dark:bg-green-500 text-white';
}

export default function FocusCalendar({ year, month, dailyTotals, selectedDate, onSelectDate, onPrevMonth, onNextMonth, canGoPrev, canGoNext }: FocusCalendarProps) {
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
    const gridStart = new Date(year, month, 1 - startWeekday);
    const cells = Array.from({ length: totalCells }, (_, i) =>
        new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    );

    const today = dateKey(new Date());
    const monthLabel = firstOfMonth.toLocaleDateString('ru', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-surface rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={onPrevMonth}
                    disabled={!canGoPrev}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                <h3 className="text-sm font-semibold text-gray-900 capitalize">{monthLabel}</h3>
                <button
                    onClick={onNextMonth}
                    disabled={!canGoNext}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                {WEEKDAYS.map(w => (
                    <div key={w} className="text-center text-xs text-gray-400 font-medium">{w}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
                {cells.map(day => {
                    const inMonth = day.getMonth() === month;
                    const key = dateKey(day);

                    if (!inMonth) {
                        return <div key={key} className="aspect-square" />;
                    }

                    const seconds = dailyTotals[key] ?? 0;
                    const isSelected = selectedDate === key;
                    const isToday = key === today;

                    return (
                        <button
                            key={key}
                            onClick={() => onSelectDate(key)}
                            title={`${day.toLocaleDateString('ru', { day: 'numeric', month: 'long' })}${seconds > 0 ? ` · ${Math.round(seconds / 60)} мин фокуса` : ''}`}
                            className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all hover:brightness-95 ${levelClasses(seconds)} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : isToday ? 'ring-1 ring-blue-300' : ''}`}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-4 text-xs text-gray-400">
                <span>Меньше</span>
                <span className="w-3.5 h-3.5 rounded bg-gray-100" />
                <span className="w-3.5 h-3.5 rounded bg-green-100 dark:bg-green-900" />
                <span className="w-3.5 h-3.5 rounded bg-green-300 dark:bg-green-700" />
                <span className="w-3.5 h-3.5 rounded bg-green-500" />
                <span className="w-3.5 h-3.5 rounded bg-green-700 dark:bg-green-500" />
                <span>Больше</span>
            </div>
        </div>
    );
}
