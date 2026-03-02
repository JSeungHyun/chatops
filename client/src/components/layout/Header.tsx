import { Menu } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import clsx from 'clsx';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Header({ title, subtitle, children, className }: HeaderProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header
      className={clsx(
        'flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4',
        className,
      )}
    >
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        {title && (
          <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2>
        )}
        {subtitle && (
          <p className="truncate text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      {children}
    </header>
  );
}
