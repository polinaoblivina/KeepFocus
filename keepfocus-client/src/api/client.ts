import axios from 'axios';
import type { ApiError } from './types';

const client = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config; 
});

client.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
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