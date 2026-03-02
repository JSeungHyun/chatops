import { useEffect, useState, useCallback } from 'react';
import api from '@/api/axios';
import { useChatStore } from '@/stores/chatStore';
import type { ChatRoom } from '@/types/chat';

export function useRooms() {
  const { rooms, setRooms } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<ChatRoom[]>('/chats');
      setRooms(response.data);
    } catch (err) {
      setError('채팅방 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [setRooms]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, isLoading, error, refetch: fetchRooms };
}
