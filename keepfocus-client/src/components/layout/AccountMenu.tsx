import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getProfile } from '../../api/profile';

export default function AccountMenu() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const updateUser = useAuthStore(state => state.updateUser);

    useEffect(() => {
        if (user && user.name === undefined) {
            getProfile()
                .then(profile => updateUser({ name: profile.name, avatarUrl: profile.avatarUrl }))
                .catch(() => { /* ignore, keep email-only fallback */ });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setOpen(o => !o)}
                title="Аккаунт"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-medium overflow-hidden hover:opacity-90 transition-opacity"
            >
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    initial
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Без имени'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <UserIcon size={15} />
                        Профиль
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <LogOut size={15} />
                        Выйти
                    </button>
                </div>
            )}
        </div>
    );
}
