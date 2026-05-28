import { create } from 'zustand';

interface User {
    userId: string;
    email: string;
}
interface AuthStore {
    token: string | null; 
    user: User | null;    

    isAuthenticated: boolean; 

    login: (token: string, user: User) => void; 
    logout: () => void;                         
}


export const useAuthStore = create<AuthStore>((set) => ({
    token: localStorage.getItem('token'),
    user: (() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) as User : null;
    })(),

    isAuthenticated: localStorage.getItem('token') !== null,

    login: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, user, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
    },
}));