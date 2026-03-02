import { useEffect, useRef, useCallback } from 'react';
import api from '@/api/axios';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useMessages } from '@/hooks/useMessages';
import { Header } from '@/components/layout/Header';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { DateSeparator } from './DateSeparator';
import { EmptyChat } from './EmptyChat';
import { Spinner } from '@/components/common/Spinner';
import type { Message } from '@/types/message';

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function ChatRoom() {
  const currentRoom = useChatStore((s) => s.currentRoom);
  const addMessage = useChatStore((s) => s.addMessage);
  const user = useAuthStore((s) => s.user);

  const { messages, isLoading, hasMore, loadMore } = useMessages(
    currentRoom?.id ?? null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Auto-scroll to bottom on initial load and new messages
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad.current) {
      messagesEndRef.current?.scrollIntoView();
      isInitialLoad.current = false;
    }
  }, [messages]);

  // Reset initial load flag when room changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [currentRoom?.id]);

  // Scroll to bottom when user sends a new message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Infinite scroll: observe sentinel for loading older messages
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const container = messagesContainerRef.current;
          const prevHeight = container?.scrollHeight ?? 0;

          loadMore();

          // Preserve scroll position after prepending
          requestAnimationFrame(() => {
            if (container) {
              const newHeight = container.scrollHeight;
              container.scrollTop += newHeight - prevHeight;
            }
          });
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleSend = async (content: string) => {
    if (!currentRoom || !user) return;

    try {
      const res = await api.post<Message>(
        `/chats/${currentRoom.id}/messages`,
        { content, type: 'TEXT' },
      );
      addMessage(res.data);
      scrollToBottom();
    } catch {
      // Send error — could add toast here
    }
  };

  if (!currentRoom) {
    return <EmptyChat />;
  }

  // Derive room display info
  const otherMembers = currentRoom.members.filter(
    (m) => m.userId !== user?.id,
  );
  const roomName =
    currentRoom.type === 'DIRECT'
      ? otherMembers[0]?.user.nickname ?? '채팅'
      : currentRoom.name ?? '그룹 채팅';
  const memberCount = currentRoom.members.length;

  return (
    <div className="flex h-full flex-col">
      <Header
        title={roomName}
        subtitle={`${memberCount}명 참여 중`}
      />

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="scrollbar-thin flex-1 overflow-y-auto px-4 py-2"
      >
        {/* Sentinel for infinite scroll */}
        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-4">
            {isLoading && <Spinner size="sm" />}
          </div>
        )}

        {/* Initial loading */}
        {isLoading && messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1] as Message | undefined;
          const nextMsg = messages[idx + 1] as Message | undefined;

          const showDate =
            !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);
          const isOwn = msg.userId === user?.id;
          const showAvatar =
            !prevMsg ||
            prevMsg.userId !== msg.userId ||
            !isSameDay(prevMsg.createdAt, msg.createdAt);
          const showTimestamp =
            !nextMsg ||
            nextMsg.userId !== msg.userId ||
            !isSameDay(nextMsg.createdAt, msg.createdAt);

          return (
            <div key={msg.id}>
              {showDate && <DateSeparator date={msg.createdAt} />}
              <div className={showAvatar ? 'mt-3' : 'mt-0.5'}>
                <MessageBubble
                  message={msg}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  showTimestamp={showTimestamp}
                />
              </div>
            </div>
          );
        })}

        {/* Typing indicator (stub — data from WebSocket in Stage 2) */}
        <TypingIndicator users={[]} />

        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
}
