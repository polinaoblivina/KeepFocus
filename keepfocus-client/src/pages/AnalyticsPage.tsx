import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSessionHistory } from '../api/sessions';
import { getErrorMessage } from '../api/client';
import type { SessionDto } from '../api/types';
import { ArrowLeft, Clock, Zap, AlertTriangle, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';
import AccountMenu from '../components/layout/AccountMenu';
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

export default function AnalyticsPage() {
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [from, setFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await getSessionHistory(
                    from + 'T00:00:00Z',
                    to + 'T23:59:59Z'
                );
                setSessions(data);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [from, to]);

    const completed = sessions.filter(s => s.status === 'Completed');
    const abandoned = sessions.filter(s => s.status === 'Abandoned');

    const totalSeconds = completed.reduce((sum, s) => sum + s.accumulatedSeconds, 0);
    const totalDistraction = completed.reduce((sum, s) => sum + s.totalDistractionSeconds, 0);
    const avgSeconds = completed.length > 0 ? Math.floor(totalSeconds / completed.length) : 0;

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

                <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">С:</label>
                        <input
                            type="date"
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">По:</label>
                        <input
                            type="date"
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">

                    <div className="bg-surface rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={15} className="text-blue-500" />
                            <p className="text-xs text-gray-500">Всего времени</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatDuration(totalSeconds)}</p>
                        <p className="text-xs text-gray-400 mt-1">{completed.length} сессий</p>
                    </div>

                    <div className="bg-surface rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={15} className="text-green-500" />
                            <p className="text-xs text-gray-500">Среднее время</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatDuration(avgSeconds)}</p>
                        <p className="text-xs text-gray-400 mt-1">на сессию</p>
                    </div>

                    <div className="bg-surface rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle size={15} className="text-amber-500" />
                            <p className="text-xs text-gray-500">Отвлечения</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatDuration(totalDistraction)}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {completed.reduce((sum, s) => sum + s.distractionCount, 0)} раз
                        </p>
                    </div>

                    <div className="bg-surface rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart2 size={15} className="text-red-400" />
                            <p className="text-xs text-gray-500">Прервано</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{abandoned.length}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {sessions.length > 0 ? `${Math.round((abandoned.length / sessions.length) * 100)}% от всех` : '—'}
                        </p>
                    </div>

                </div>

                <div className="bg-surface rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900 text-sm">История сессий</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <p className="text-gray-400 text-sm">Загрузка...</p>
                        </div>
                    ) : error ? (
                        <div className="px-5 py-8 text-center text-red-500 text-sm">{error}</div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2">
                            <Clock size={32} className="text-gray-200 dark:text-gray-700" />
                            <p className="text-gray-400 text-sm">Нет сессий за выбранный период</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {sessions.map(session => (
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

            </main>
        </div>
    );
}