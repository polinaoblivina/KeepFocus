import * as signalR from '@microsoft/signalr';

export function createSessionConnection(sessionId: string): signalR.HubConnection {
    const token = localStorage.getItem('token');

    return new signalR.HubConnectionBuilder()
        .withUrl(`/hubs/session?sessionId=${sessionId}&access_token=${token}`)
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();
}
