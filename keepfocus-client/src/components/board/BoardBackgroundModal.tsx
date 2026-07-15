import { useRef, useState } from 'react';

interface Props {
    current: string | null;
    onSelect: (value: string | null) => void;
    onClose: () => void;
}

const PRESETS: { label: string; value: string }[] = [
    { label: 'Сумерки', value: 'linear-gradient(135deg,#1e3a8a,#6d28d9)' },
    { label: 'Океан', value: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
    { label: 'Закат', value: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { label: 'Лес', value: 'linear-gradient(135deg,#059669,#065f46)' },
    { label: 'Графит', value: 'linear-gradient(135deg,#334155,#0f172a)' },
    { label: 'Слива', value: 'linear-gradient(135deg,#7c3aed,#db2777)' },
];

export default function BoardBackgroundModal({ current, onSelect, onClose }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Выберите файл изображения');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Изображение слишком большое (макс. 5 МБ)');
            return;
        }

        setError('');
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') onSelect(reader.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Фон доски</h3>

                <div className="grid grid-cols-3 gap-3 mb-5">
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            onClick={() => onSelect(p.value)}
                            className={`h-16 rounded-lg border-2 transition-all ${current === p.value ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                                }`}
                            style={{ backgroundImage: p.value }}
                            title={p.label}
                        />
                    ))}
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">Изображение с компьютера</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mb-5 py-2.5 border border-dashed border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                    Выбрать файл…
                </button>
                {error && <p className="text-xs text-red-600 -mt-4 mb-5">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={() => onSelect(null)}
                        className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                        Убрать фон
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}