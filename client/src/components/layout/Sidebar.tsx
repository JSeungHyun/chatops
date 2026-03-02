import { MessageSquarePlus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/common/Avatar';

interface SidebarProps {
  children?: React.ReactNode;
  onNewChat?: () => void;
}

export function Sidebar({ children, onNewChat }: SidebarProps) {
  const navigate = useNavigate();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 flex w-80 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Top: Logo + New Chat */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
          <h1 className="text-lg font-bold text-primary-600">ChatOps</h1>
          <button
            onClick={onNewChat}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
            aria-label="New chat"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
        </div>

        {/* Middle: Chat List */}
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Bottom: User Info */}
        {user && (
          <div className="flex items-center gap-3 border-t border-slate-200 p-4">
            <Avatar name={user.nickname} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.nickname}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
