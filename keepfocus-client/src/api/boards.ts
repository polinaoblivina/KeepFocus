import client from './client';
import type { BoardDto, BoardSummaryDto, ListDto, CardDto, ChecklistDto, ChecklistItemDto } from './types';

export async function getBoards(): Promise<BoardSummaryDto[]> {
    const response = await client.get<BoardSummaryDto[]>('/api/boards');
    return response.data;
}

export async function getBoard(boardId: string): Promise<BoardDto> {
    const response = await client.get<BoardDto>(`/api/boards/${boardId}`);
    return response.data;
}

export async function createBoard(title: string, description?: string): Promise<BoardSummaryDto> {
    const response = await client.post<BoardSummaryDto>('/api/boards', { title, description });
    return response.data;
}

export async function updateBoard(boardId: string, title: string, description?: string): Promise<BoardSummaryDto> {
    const response = await client.put<BoardSummaryDto>(`/api/boards/${boardId}`, { title, description });
    return response.data;
}

export async function deleteBoard(boardId: string): Promise<void> {
    await client.delete(`/api/boards/${boardId}`);
}

export async function addList(boardId: string, title: string): Promise<ListDto> {
    const response = await client.post<ListDto>(`/api/boards/${boardId}/lists`, { title });
    return response.data;
}

export async function renameList(boardId: string, listId: string, title: string): Promise<void> {
    await client.put(`/api/boards/${boardId}/lists/${listId}`, { title });
}

export async function reorderLists(boardId: string,positions: { listId: string; position: number }[]): Promise<void> {
    await client.put(`/api/boards/${boardId}/lists/reorder`, { positions });
}

export async function deleteList(boardId: string, listId: string): Promise<void> {
    await client.delete(`/api/boards/${boardId}/lists/${listId}`);
}

export async function addCard(boardId: string, listId: string, title: string): Promise<CardDto> {
    const response = await client.post<CardDto>(`/api/boards/${boardId}/cards`, { listId, title });
    return response.data;
}

export async function updateCard(boardId: string, cardId: string, title: string, description?: string, dueDate?: string): Promise<void> {
    await client.put(`/api/boards/${boardId}/cards/${cardId}`, { title, description, dueDate });
}

export async function moveCard( boardId: string, cardId: string, targetListId: string, position: number): Promise<void> {
    await client.put(`/api/boards/${boardId}/cards/${cardId}/move`, { targetListId, position });
}

export async function deleteCard(boardId: string, listId: string, cardId: string): Promise<void> {
    await client.delete(`/api/boards/${boardId}/lists/${listId}/cards/${cardId}`);
}

export async function addChecklist(boardId: string, cardId: string, title: string): Promise<ChecklistDto> {
    const response = await client.post<ChecklistDto>(`/api/boards/${boardId}/cards/${cardId}/checklists`,{ title });
    return response.data;
}

export async function updateChecklist( boardId: string, cardId: string, checklistId: string, title: string): Promise<void> {
    await client.put(`/api/boards/${boardId}/cards/${cardId}/checklists/${checklistId}`, { title });
}

export async function removeChecklist(boardId: string, cardId: string, checklistId: string): Promise<void> {
    await client.delete(`/api/boards/${boardId}/cards/${cardId}/checklists/${checklistId}`);
}

export async function addChecklistItem(boardId: string, cardId: string, checklistId: string, content: string): Promise<ChecklistItemDto> {
    const response = await client.post<ChecklistItemDto>(`/api/boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items`,{ content });
    return response.data;
}

export async function updateChecklistItem(boardId: string, cardId: string, checklistId: string, itemId: string, content: string): Promise<void> {
    await client.put(`/api/boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items/${itemId}`, { content });
}

export async function toggleChecklistItem(boardId: string, cardId: string, checklistId: string, itemId: string): Promise<void> {
    await client.post(`/api/boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items/${itemId}/toggle`);
}

export async function removeChecklistItem(boardId: string, cardId: string, checklistId: string, itemId: string): Promise<void> {
    await client.delete(`/api/boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items/${itemId}`);
}

export async function reorderChecklistItems(boardId: string, cardId: string, checklistId: string, positions: { itemId: string; position: number }[]): Promise<void> {
    await client.put(`/api/boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items/reorder`, { positions });
}