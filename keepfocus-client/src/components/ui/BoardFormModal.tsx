import { useState } from 'react';

interface BoardFormModalProps {
    initialTitle?: string;
    initialDescription?: string;
    onSubmit: (title: string, description?: string) => Promise<void>;
    onCancel: () => void;
}

export default function BoardFormModal({initialTitle = '', initialDescription = '', onSubmit, onCancel,}: BoardFormModalProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDesc] = useState(initialDescription);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = initialTitle !== '';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        setSaving(true);
        setError(null);
        try {
            await onSubmit(title.trim(), description.trim() || undefined);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Что-то пошло не так');
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

                <h3 className="text-lg font-semibold text-gray-900 mb-5">
                    {isEditing ? 'Редактировать доску' : 'Новая доска'}
                </h3>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Название
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Например: Мой проект"
                            required
                            autoFocus
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Описание <span className="text-gray-400">(необязательно)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="Краткое описание..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {saving
                                ? (isEditing ? 'Сохраняем...' : 'Создаём...')
                                : (isEditing ? 'Сохранить' : 'Создать')}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}