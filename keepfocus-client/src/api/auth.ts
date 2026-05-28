import client from './client';
import type { AuthDto } from './types';

export async function register(email: string, password: string): Promise<AuthDto> {
    const response = await client.post<AuthDto>('/api/auth/register', { email, password });
    return response.data;
}

export async function login(email: string, password: string): Promise<AuthDto> {
    const response = await client.post<AuthDto>('/api/auth/login', { email, password });
    return response.data;
}