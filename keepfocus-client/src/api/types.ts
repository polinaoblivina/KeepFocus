export interface AuthDto {
    token: string;
    userId: string;
    email: string;
}
export interface BoardSummaryDto {
    id: string;
    title: string;
    description: string | null;
    updatedAt: string;
}
export interface BoardDto {
    id: string;
    title: string;
    description: string | null;
    updatedAt: string;
    lists: ListDto[];
}
export interface ListDto {
    id: string;
    title: string;
    position: number;
    cards: CardDto[];
}
export interface CardDto {
    id: string;
    title: string;
    description: string | null;
    position: number;
    dueDate: string | null; 
    checklists: ChecklistDto[];
}

export interface ChecklistDto {
    id: string;
    title: string;
    completedCount: number;
    totalCount: number;
    items: ChecklistItemDto[];
}

export interface ChecklistItemDto {
    id: string;
    content: string;
    isChecked: boolean;
    position: number;
}

export interface SessionDto {
    id: string;
    cardId: string | null;
    type: 'Pomodoro' | 'Custom';
    mode: 'Soft' | 'Hard';
    status: 'Active' | 'Paused' | 'Completed' | 'Abandoned';
    plannedDurationSeconds: number;
    elapsedSeconds: number;
    accumulatedSeconds: number;
    startedAt: string;
    endedAt: string | null;
    distractionCount: number;
    totalDistractionSeconds: number;
}

export interface SessionState {
    status: 'Active' | 'Paused' | 'Completed' | 'Abandoned';
    elapsed: number;
}

export interface ApiError {
    message: string;
    code?: string;
    errors?: string[];
}

export interface ProfileDto {
    userId: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    createdAt: string;
}