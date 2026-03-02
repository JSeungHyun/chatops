import { useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import api from '@/api/axios';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { ChatRoom, RoomType } from '@/types/chat';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateRoomBody {
  type: RoomType;
  name?: string;
  memberIds: string[];
}

export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const { rooms, setRooms, setCurrentRoom } = useChatStore();

  const [type, setType] = useState<RoomType>('DIRECT');
  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  function handleClose() {
    setType('DIRECT');
    setGroupName('');
    setMemberInput('');
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const memberIds = memberInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (memberIds.length === 0) {
      setError('최소 한 명의 사용자 ID를 입력해주세요.');
      return;
    }

    if (type === 'GROUP' && !groupName.trim()) {
      setError('그룹 채팅방 이름을 입력해주세요.');
      return;
    }

    const body: CreateRoomBody = { type, memberIds };
    if (type === 'GROUP') body.name = groupName.trim();

    setIsSubmitting(true);
    try {
      const response = await api.post<ChatRoom>('/chats', body);
      const newRoom = response.data;
      setRooms([newRoom, ...rooms.filter((r) => r.id !== newRoom.id)]);
      setCurrentRoom(newRoom);
      handleClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? '채팅방 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">새 채팅 시작</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">채팅 유형</p>
            <div className="flex gap-2">
              {(['DIRECT', 'GROUP'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={clsx(
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                    type === t
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {t === 'DIRECT' ? '1:1 채팅' : '그룹 채팅'}
                </button>
              ))}
            </div>
          </div>

          {type === 'GROUP' && (
            <Input
              label="그룹 채팅방 이름"
              placeholder="채팅방 이름을 입력하세요"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          )}

          <Input
            label="사용자 ID"
            placeholder={
              type === 'DIRECT'
                ? '상대방 사용자 ID를 입력하세요'
                : '사용자 ID를 쉼표로 구분하여 입력하세요'
            }
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
          />

          <p className="text-xs text-slate-400">
            사용자 검색 기능은 추후 지원 예정입니다. 현재는 사용자 ID를 직접 입력해주세요.
          </p>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" loading={isSubmitting}>
              채팅 시작
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
