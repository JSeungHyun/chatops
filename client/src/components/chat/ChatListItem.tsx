import clsx from 'clsx';
import { Users } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { formatRelativeTime } from '@/utils/format';
import type { ChatRoom } from '@/types/chat';

interface ChatListItemProps {
  room: ChatRoom;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}

export function ChatListItem({ room, isActive, currentUserId, onClick }: ChatListItemProps) {
  const otherMember =
    room.type === 'DIRECT'
      ? room.members.find((m) => m.userId !== currentUserId)
      : null;

  const displayName =
    room.type === 'DIRECT'
      ? (otherMember?.user.nickname ?? '알 수 없는 사용자')
      : (room.name ?? '그룹 채팅');

  const avatarSrc =
    room.type === 'DIRECT' ? (otherMember?.user.avatar ?? null) : null;

  const lastMessage = room.messages?.[0];
  const lastMessageText =
    lastMessage?.type === 'IMAGE'
      ? '이미지'
      : lastMessage?.type === 'FILE'
        ? '파일'
        : (lastMessage?.content ?? null);

  const timestamp = lastMessage?.createdAt ?? room.createdAt;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        isActive
          ? 'border-l-2 border-primary-600 bg-primary-50 pl-[14px]'
          : 'border-l-2 border-transparent hover:bg-slate-50',
      )}
    >
      {room.type === 'DIRECT' ? (
        <Avatar src={avatarSrc} name={displayName} size="md" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <Users size={18} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={clsx(
              'truncate text-sm font-medium',
              isActive ? 'text-primary-700' : 'text-slate-900',
            )}
          >
            {displayName}
          </span>
          <span className="shrink-0 text-xs text-slate-400">
            {formatRelativeTime(timestamp)}
          </span>
        </div>
        {lastMessageText !== null && (
          <p className="mt-0.5 truncate text-xs text-slate-500">{lastMessageText}</p>
        )}
      </div>
    </button>
  );
}
