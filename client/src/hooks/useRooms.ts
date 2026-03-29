import { useEffect, useState, useCallback } from 'react';
import api from '@/api/axios';
import { useChatStore } from '@/stores/chatStore';
import type { ChatRoom } from '@/types/chat';

export function useRooms() {
  const { rooms, setRooms } = useChatStore();
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<ChatRoom[]>('/chats');
      setRooms(response.data);

      // Fetch initial online statuses for all members
      const userIds = [
        ...new Set(
          response.data.flatMap((room) => room.members.map((m) => m.userId)),
        ),
      ];
      if (userIds.length > 0) {
        const statusRes = await api.get<Record<string, boolean>>(
          '/users/online-status',
          { params: { userIds: userIds.join(',') } },
        );
        setOnlineUsers(statusRes.data);
      }
    } catch (err) {
      setError('채팅방 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [setRooms, setOnlineUsers]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, isLoading, error, refetch: fetchRooms };
}
