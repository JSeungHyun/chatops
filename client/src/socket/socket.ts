import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

export function getStompClient(): Client {
  if (!stompClient) {
    stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
    });
  }
  return stompClient;
}

/** Alias for getStompClient — matches task spec API */
export function getClient(): Client | null {
  return stompClient;
}

export function isConnected(): boolean {
  return stompClient?.connected ?? false;
}

export function connectStomp(token: string): Client {
  const client = getStompClient();
  client.connectHeaders = { Authorization: `Bearer ${token}` };
  if (!client.active) {
    client.activate();
  }
  return client;
}

export function disconnectStomp(): void {
  if (stompClient?.active) {
    stompClient.deactivate();
  }
  stompClient = null;
}

/** Generic subscribe — maps raw IMessage frames */
export function subscribe(
  destination: string,
  callback: (msg: IMessage) => void,
): StompSubscription | null {
  const client = getStompClient();
  if (!client.connected) return null;
  return client.subscribe(destination, callback);
}

export function subscribeToRoom(
  roomId: string,
  callback: (message: unknown) => void,
): StompSubscription | null {
  const client = getStompClient();
  if (!client.connected) return null;
  return client.subscribe(`/topic/room/${roomId}`, (frame) => {
    try {
      const data = JSON.parse(frame.body);
      callback(data);
    } catch {
      // ignore malformed frames
    }
  });
}

/** Generic publish */
export function publish(destination: string, body: object): void {
  stompClient?.publish({ destination, body: JSON.stringify(body) });
}

/** Alias kept for backward compat with MessageInput */
export function sendStompMessage(destination: string, body: unknown): void {
  stompClient?.publish({ destination, body: JSON.stringify(body) });
}
