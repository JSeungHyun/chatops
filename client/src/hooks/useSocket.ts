import { useEffect, useRef, useCallback } from 'react';
import { StompSubscription } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import {
  connectStomp,
  disconnectStomp,
  getStompClient,
  subscribe as stompSubscribe,
  subscribeToRoom,
} from '../socket/socket';
import { useAuthStore } from '../stores/authStore';

interface UseSocketOptions {
  roomId?: string;
  onMessage?: (data: unknown) => void;
  onTyping?: (data: unknown) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function useSocket({
  roomId,
  onMessage,
  onTyping,
  onConnected,
  onDisconnected,
}: UseSocketOptions = {}) {
  const token = useAuthStore((s) => s.token);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const typingSubRef = useRef<StompSubscription | null>(null);
  const errorSubRef = useRef<StompSubscription | null>(null);
  const connectedRef = useRef(false);

  const subscribeRoom = useCallback(() => {
    if (!roomId) return;
    subscriptionRef.current?.unsubscribe();
    typingSubRef.current?.unsubscribe();
    if (onMessage) {
      subscriptionRef.current = subscribeToRoom(roomId, onMessage);
    }
    if (onTyping) {
      const client = getStompClient();
      if (client.connected) {
        typingSubRef.current = client.subscribe(
          `/topic/room/${roomId}/typing`,
          (frame) => {
            try {
              const data = JSON.parse(frame.body);
              onTyping(data);
            } catch {
              // ignore malformed frames
            }
          },
        );
      }
    }
  }, [roomId, onMessage, onTyping]);

  useEffect(() => {
    if (!token) return;

    const client = connectStomp(token);

    client.onConnect = () => {
      connectedRef.current = true;
      onConnected?.();
      subscribeRoom();
      // Subscribe to server-side personal error queue
      errorSubRef.current = stompSubscribe('/user/queue/errors', (frame) => {
        try {
          const err = JSON.parse(frame.body) as { message?: string };
          toast.error(err.message ?? '서버 오류가 발생했습니다.');
        } catch {
          toast.error('서버 오류가 발생했습니다.');
        }
      });
    };

    client.onDisconnect = () => {
      connectedRef.current = false;
      onDisconnected?.();
    };

    client.onStompError = (frame) => {
      const msg = frame.headers['message'] ?? 'WebSocket connection error';
      toast.error(msg);
    };

    // If already connected (e.g. client re-used), subscribe immediately
    if (client.connected) {
      connectedRef.current = true;
      subscribeRoom();
    }

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      typingSubRef.current?.unsubscribe();
      typingSubRef.current = null;
      errorSubRef.current?.unsubscribe();
      errorSubRef.current = null;
    };
  }, [token, subscribeRoom, onConnected, onDisconnected]);

  // Re-subscribe when roomId changes and client is already connected
  useEffect(() => {
    if (!roomId) return;
    const client = getStompClient();
    if (client.connected) {
      if (onMessage) {
        subscriptionRef.current?.unsubscribe();
        subscriptionRef.current = subscribeToRoom(roomId, onMessage);
      }
      if (onTyping) {
        typingSubRef.current?.unsubscribe();
        typingSubRef.current = client.subscribe(
          `/topic/room/${roomId}/typing`,
          (frame) => {
            try {
              const data = JSON.parse(frame.body);
              onTyping(data);
            } catch {
              // ignore malformed frames
            }
          },
        );
      }
    }
  }, [roomId, onMessage, onTyping]);

  const disconnect = useCallback(() => {
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = null;
    typingSubRef.current?.unsubscribe();
    typingSubRef.current = null;
    disconnectStomp();
  }, []);

  return { disconnect };
}

export default useSocket;
