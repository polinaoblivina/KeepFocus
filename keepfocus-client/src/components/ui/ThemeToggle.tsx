import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeToggle() {
    const isDark = useThemeStore(s => s.isDark);
    const toggle = useThemeStore(s => s.toggle);

    return (
        <button
            onClick={toggle}
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}