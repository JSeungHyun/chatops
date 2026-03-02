import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useRooms } from '@/hooks/useRooms';
import { ChatListItem } from './ChatListItem';
import { Spinner } from '@/components/common/Spinner';

interface ChatListProps {
  onSelectRoom?: () => void;
}

export function ChatList({ onSelectRoom }: ChatListProps) {
  const { rooms, isLoading } = useRooms();
  const { currentRoom, setCurrentRoom } = useChatStore();
  const user = useAuthStore((s) => s.user);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
        <p className="text-sm text-slate-500">채팅방이 없습니다.</p>
        <p className="text-xs text-slate-400">새 채팅을 시작해보세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {rooms.map((room) => (
        <ChatListItem
          key={room.id}
          room={room}
          isActive={currentRoom?.id === room.id}
          currentUserId={user?.id ?? ''}
          onClick={() => {
            setCurrentRoom(room);
            onSelectRoom?.();
          }}
        />
      ))}
    </div>
  );
}
