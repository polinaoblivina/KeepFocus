import client from './client';
import type { SessionDto } from './types';

export async function getActiveSession(): Promise<SessionDto | null> {
    const response = await client.get<SessionDto | null>('/api/sessions/active');
    return response.data;
}

export async function getSessionHistory(from?: string, to?: string): Promise<SessionDto[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await client.get<SessionDto[]>(`/api/sessions/history?${params}`);
    return response.data;
}

export async function startSession(mode: 'Soft' | 'Hard', type: 'Pomodoro' | 'Custom', customDurationSeconds?: number, cardId?: string): Promise<SessionDto> {
    const response = await client.post<SessionDto>('/api/sessions/start', {mode, type, customDurationSeconds, cardId,});
    return response.data;
}

export async function completeSession(sessionId: string): Promise<SessionDto> {
    const response = await client.post<SessionDto>(`/api/sessions/${sessionId}/complete`);
    return response.data;
}

export async function abandonSession(sessionId: string): Promise<SessionDto> {
    const response = await client.post<SessionDto>(`/api/sessions/${sessionId}/abandon`);
    return response.data;
}

export async function startBreak(sessionId: string, breakType: 'ShortBreak' | 'LongBreak' | 'Manual', durationSeconds: number): Promise<SessionDto> {
    const response = await client.post<SessionDto>(`/api/sessions/${sessionId}/break`, {breakType, durationSeconds,});
    return response.data;
}