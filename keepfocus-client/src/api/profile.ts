import client from './client';
import type { ProfileDto } from './types';

export async function getProfile(): Promise<ProfileDto> {
    const response = await client.get<ProfileDto>('/api/profile');
    return response.data;
}

export async function updateProfile(name: string): Promise<ProfileDto> {
    const response = await client.put<ProfileDto>('/api/profile', { name });
    return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await client.put('/api/profile/password', { currentPassword, newPassword });
}

export async function uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post<{ avatarUrl: string }>('/api/profile/avatar', formData, {
        headers: { 'Content-Type': undefined },
    });
    return response.data.avatarUrl;
}

export async function deleteAvatar(): Promise<void> {
    await client.delete('/api/profile/avatar');
}
