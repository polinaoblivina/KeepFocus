import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getSessionHistory } from '../api/sessions';
import { getErrorMessage } from '../api/client';
import type { SessionDto } from '../api/types';
import { ArrowLeft, Clock, Flame, Trophy, BarChart2, X } from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';
import AccountMenu from '../components/layout/AccountMenu';
import FocusCalendar from '../components/analytics/FocusCalendar';
import { dateKey } from '../utils/date';

const HISTORY_DAYS = 365;

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}ч ${m}м`;
    if (m > 0) return `${m}м ${s}с`;
    return `${s}с`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ru', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
}

function statusColor(status: SessionDto['status']): string {
    switch (status) {
        case 'Completed': return 'text-green-600 bg-green-50';
        case 'Abandoned': return 'text-red-500 bg-red-50';
        case 'Active': return 'text-blue-600 bg-blue-50';
        case 'Paused': return 'text-amber-600 bg-amber-50';
        default: return '';
    }
}

function statusLabel(status: SessionDto['status']): string {
    switch (status) {
        case 'Completed': return 'Завершена';
        case 'Abandoned': return 'Прервана';
        case 'Active': return 'Активна';
        case 'Paused': return 'Пауза';
        default: return '';
    }
}

function computeStreak(dailyTotals: Record<string, number>): number {
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!dailyTotals[dateKey(cursor)]) {
        cursor.setDate(cursor.getDate() - 1);
    }
    let streak = 0;
    while (dailyTotals[dateKey(cursor)] > 0) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

export default function AnalyticsPage() {
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const today = useMemo(() => new Date(), []);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const from = new Date();
                from.setDate(from.getDate() - HISTORY_DAYS);
                const data = await getSessionHistory(
                    from.toISOString().split('T')[0] + 'T00:00:00Z',
                    new Date().toISOString().split('T')[0] + 'T23:59:59Z'
                );
                setSessions(data);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const completed = sessions.filter(s => s.status === 'Completed');

    const dailyTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        for (const s of completed) {
            const key = dateKey(new Date(s.startedAt));
            totals[key] = (totals[key] ?? 0) + s.accumulatedSeconds;
        }
        return totals;
    }, [completed]);

    const streak = useMemo(() => computeStreak(dailyTotals), [dailyTotals]);

    const bestDay = useMemo(() => {
        let bestKey: string | null = null;
        let bestSeconds = 0;
        for (const [key, seconds] of Object.entries(dailyTotals)) {
            if (seconds > bestSeconds) { bestSeconds = seconds; bestKey = key; }
        }
        return bestKey ? { key: bestKey, seconds: bestSeconds } : null;
    }, [dailyTotals]);

    const totalSeconds = completed.reduce((sum, s) => sum + s.accumulatedSeconds, 0);
    const avgSeconds = completed.length > 0 ? Math.floor(totalSeconds / completed.length) : 0;
    const distractionCount = completed.reduce((sum, s) => sum + s.distractionCount, 0);

    const minMonthIndex = (today.getFullYear() * 12 + today.getMonth()) - 11;
    const viewMonthIndex = viewYear * 12 + viewMonth;
    const canGoPrev = viewMonthIndex > minMonthIndex;
    const canGoNext = viewMonthIndex < today.getFullYear() * 12 + today.getMonth();

    function prevMonth() {
        setViewMonth(m => {
            if (m === 0) { setViewYear(y => y - 1); return 11; }
            return m - 1;
        });
    }

    function nextMonth() {
        setViewMonth(m => {
            if (m === 11) { setViewYear(y => y + 1); return 0; }
            return m + 1;
        });
    }

    const selectedDaySessions = selectedDate
        ? sessions
            .filter(s => dateKey(new Date(s.startedAt)) === selectedDate)
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        : [];

    return (
        <div className="min-h-screen bg-gray-50">

            <header className="bg-surface border-b border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link to="/boards" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <ThemeToggle />
                    <div className="flex items-center gap-2">
                        <BarChart2 size={20} className="text-blue-600" />
                        <h1 className="text-lg font-semibold text-gray-900">Аналитика</h1>
                    </div>
                    <div className="ml-auto">
                        <AccountMenu />
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-gray-400 text-sm">Загрузка...</p>
                    </div>
                ) : error ? (
                    <div className="px-5 py-8 text-center text-red-500 text-sm">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                            <div className="bg-surface rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Flame size={15} className="text-orange-500" />
                                    <p className="text-xs text-gray-500">Текущий стрик</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{streak} {streak === 1 ? 'день' : streak >= 2 && streak <= 4 ? 'дня' : 'дней'}</p>
                                <p className="text-xs text-gray-400 mt-1">подряд с фокус-сессией</p>
                            </div>

                            <div className="bg-surface rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Trophy size={15} className="text-amber-500" />
                                    <p className="text-xs text-gray-500">Лучший день</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {bestDay ? formatDuration(bestDay.seconds) : '—'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {bestDay ? new Date(bestDay.key).toLocaleDateString('ru', { day: 'numeric', month: 'long' }) : 'пока нет данных'}
                                </p>
                            </div>

                            <div className="bg-surface rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock size={15} className="text-blue-500" />
                                    <p className="text-xs text-gray-500">Всего за год</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{formatDuration(totalSeconds)}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {completed.length} сессий · в среднем {formatDuration(avgSeconds)}
                                    {distractionCount > 0 && ` · ${distractionCount} отвлечений`}
                                </p>
                            </div>

                        </div>

                        <div className="mb-6">
                            <FocusCalendar
                                year={viewYear}
                                month={viewMonth}
                                dailyTotals={dailyTotals}
                                selectedDate={selectedDate}
                                onSelectDate={d => setSelectedDate(prev => prev === d ? null : d)}
                                onPrevMonth={prevMonth}
                                onNextMonth={nextMonth}
                                canGoPrev={canGoPrev}
                                canGoNext={canGoNext}
                            />
                        </div>

                        <div className="bg-surface rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900 text-sm">
                                    {selectedDate
                                        ? new Date(selectedDate).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'Сессии за день'}
                                </h2>
                                {selectedDate && (
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {!selectedDate ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-2">
                                    <Clock size={32} className="text-gray-200 dark:text-gray-700" />
                                    <p className="text-gray-400 text-sm">Нажмите на день в календаре, чтобы увидеть сессии</p>
                                </div>
                            ) : selectedDaySessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-2">
                                    <Clock size={32} className="text-gray-200 dark:text-gray-700" />
                                    <p className="text-gray-400 text-sm">В этот день сессий не было</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {selectedDaySessions.map(session => (
                                        <div key={session.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">

                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor(session.status)}`}>
                                                {statusLabel(session.status)}
                                            </span>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">
                                                    {session.type === 'Pomodoro' ? 'Pomodoro' : 'Custom'}
                                                    {' · '}
                                                    {session.mode === 'Soft' ? 'Soft' : 'Hard'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {formatDate(session.startedAt)}
                                                </p>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatDuration(session.accumulatedSeconds)}
                                                </p>
                                                {session.distractionCount > 0 && (
                                                    <p className="text-xs text-amber-500">
                                                        {session.distractionCount} отвл.
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}
