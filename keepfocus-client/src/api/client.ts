import axios from 'axios';
import type { ApiError, AuthDto } from './types';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
    baseURL: '/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

function redirectToLogin() {
    useAuthStore.getState().logout();
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
    }
}

let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
    if (!refreshPromise) {
        refreshPromise = axios
            .post<AuthDto>('/api/auth/refresh', {}, { withCredentials: true })
            .then(({ data }) => {
                useAuthStore.getState().setToken(data.token);
                return data.token;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

client.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
        const isAuthEndpoint = originalRequest?.url?.includes('/api/auth/');

        if (error.response?.status !== 401 || !originalRequest || isAuthEndpoint) {
            if (error.response?.status === 401 && isAuthEndpoint) redirectToLogin();
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            redirectToLogin();
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        try {
            const newToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
        } catch {
            redirectToLogin();
            return Promise.reject(error);
        }
    }
);

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiError;

        if (data?.errors && data.errors.length > 0) {
            return data.errors[0];
        }
        if (data?.message) {
            return data.message;
        }
        if (!error.response) {
            return 'Нет соединения с сервером';
        }
    }

    return 'Произошла неизвестная ошибка';
}

export default client;