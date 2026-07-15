interface ConfirmModalProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;     
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmText = 'Подтвердить', cancelText = 'Отмена', danger = false, onConfirm, onCancel,}: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-6">

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 mb-6">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${danger
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
}