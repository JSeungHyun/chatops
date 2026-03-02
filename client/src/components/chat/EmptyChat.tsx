import { MessageSquare } from 'lucide-react';

export function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
        <MessageSquare className="h-8 w-8 text-primary-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          채팅을 시작하세요
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          왼쪽 목록에서 채팅방을 선택하거나 새 채팅을 만들어 보세요.
        </p>
      </div>
    </div>
  );
}
