import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBoards, createBoard, updateBoard, deleteBoard } from '../api/boards';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { BoardSummaryDto } from '../api/types';
import ConfirmModal from '../components/ui/ConfirmModal';
import BoardFormModal from '../components/board/BoardFormModal';
import { Plus, LogOut, Trash2, Layout, ChartNoAxesColumn, Pencil } from 'lucide-react';

export default function BoardsPage() {
    const [boards, setBoards] = useState<BoardSummaryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [editingBoard, setEditingBoard] = useState<BoardSummaryDto | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);

    useEffect(() => {
        async function loadBoards() {
            try {
                const data = await getBoards();
                setBoards(data);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }
        loadBoards();
    }, []);

    async function handleCreate(title: string, description?: string) {
        const board = await createBoard(title, description);
        setBoards(prev => [board, ...prev]);
        setShowCreate(false);
    }

    async function handleUpdate(title: string, description?: string) {
        if (!editingBoard) return;
        const updated = await updateBoard(editingBoard.id, title, description);
        setBoards(prev => prev.map(b => b.id === updated.id ? updated : b));
        setEditingBoard(null);
    }

    function handleDeleteClick(boardId: string, e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        setConfirmDelete(boardId);
    }

    async function doDelete() {
        if (!confirmDelete) return;
        try {
            await deleteBoard(confirmDelete);
            setBoards(prev => prev.filter(b => b.id !== confirmDelete));
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setConfirmDelete(null);
        }
    }

    function handleLogout() {
        logout();
        navigate('/login');
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">Загрузка...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">

            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">KeepFocus</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{user?.email}</span>
                        <Link to="/analytics" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                            <ChartNoAxesColumn size={16} />
                            Аналитика
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                            <LogOut size={16} />
                            Выйти
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Мои доски</h2>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus size={16} />
                        Создать доску
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                        {error}
                    </div>
                )}

                {boards.length === 0 ? (
                    <div className="text-center py-20">
                        <Layout size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">Нет досок. Создайте первую!</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                            Создать доску
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {boards.map(board => (
                            <Link
                                key={board.id}
                                to={`/boards/${board.id}`}
                                className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{board.title}</h3>
                                        {board.description && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{board.description}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-3">
                                            Обновлено: {new Date(board.updatedAt).toLocaleDateString('ru')}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ml-2 transition-all">
                                        <button
                                            onPointerDown={e => e.stopPropagation()}
                                            onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setEditingBoard(board);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 rounded transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={e => handleDeleteClick(board.id, e)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {showCreate && (
                <BoardFormModal
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreate(false)}
                />
            )}

            {editingBoard && (
                <BoardFormModal
                    initialTitle={editingBoard.title}
                    initialDescription={editingBoard.description ?? ''}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingBoard(null)}
                />
            )}

            {confirmDelete && (
                <ConfirmModal
                    title="Удалить доску?"
                    message="Все списки и карточки будут удалены. Это действие нельзя отменить."
                    confirmText="Удалить"
                    danger
                    onConfirm={doDelete}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

        </div>
    );
}