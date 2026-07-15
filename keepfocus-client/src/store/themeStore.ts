import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

function apply(theme: Theme) {
    const dark = theme === 'dark' || (theme === 'system' && systemDark());
    document.documentElement.classList.toggle('dark', dark);
}

interface ThemeState {
    theme: Theme;
    isDark: boolean;
    setTheme: (t: Theme) => void;
    toggle: () => void;
}

const stored = (localStorage.getItem('kf-theme') as Theme) || 'system';

export const useThemeStore = create<ThemeState>((set, get) => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (get().theme === 'system') { apply('system'); set({ isDark: systemDark() }); }
    });

    return {
        theme: stored,
        isDark: stored === 'dark' || (stored === 'system' && systemDark()),
        setTheme: (t) => {
            localStorage.setItem('kf-theme', t);
            apply(t);
            set({ theme: t, isDark: t === 'dark' || (t === 'system' && systemDark()) });
        },
        toggle: () => get().setTheme(get().isDark ? 'light' : 'dark'),
    };
});