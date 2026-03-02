import { useEffect, useCallback, useRef } from 'react';
import api from '@/api/axios';
import { useChatStore } from '@/stores/chatStore';
import type { Message } from '@/types/message';

interface PaginatedResponse {
  data: Message[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useMessages(roomId: string | null) {
  const {
    messages,
    hasMore,
    isLoadingMessages,
    setMessages,
    prependMessages,
    resetMessages,
    setCurrentPage,
    setTotalPages,
    setHasMore,
    setIsLoadingMessages,
  } = useChatStore();

  const currentPageRef = useRef(1);

  const fetchMessages = useCallback(
    async (page: number, prepend = false) => {
      if (!roomId) return;

      setIsLoadingMessages(true);
      try {
        const res = await api.get<PaginatedResponse>(
          `/chats/${roomId}/messages`,
          { params: { page, limit: 20 } },
        );

        const { data, meta } = res.data;
        // API returns desc order (newest first) — reverse for chronological display
        const reversed = [...data].reverse();

        if (prepend) {
          prependMessages(reversed);
        } else {
          setMessages(reversed);
        }

        currentPageRef.current = meta.page;
        setCurrentPage(meta.page);
        setTotalPages(meta.totalPages);
        setHasMore(meta.page < meta.totalPages);
      } catch {
        // Error handled silently — messages stay as-is
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [roomId, setMessages, prependMessages, setCurrentPage, setTotalPages, setHasMore, setIsLoadingMessages],
  );

  // Fetch initial messages when roomId changes
  useEffect(() => {
    resetMessages();
    currentPageRef.current = 1;
    if (roomId) {
      fetchMessages(1);
    }
  }, [roomId, fetchMessages, resetMessages]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMessages) return;
    fetchMessages(currentPageRef.current + 1, true);
  }, [hasMore, isLoadingMessages, fetchMessages]);

  return { messages, isLoading: isLoadingMessages, hasMore, loadMore };
}
