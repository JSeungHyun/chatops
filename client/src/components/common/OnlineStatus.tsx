import clsx from 'clsx';

interface OnlineStatusProps {
  online: boolean;
  className?: string;
}

export function OnlineStatus({ online, className }: OnlineStatusProps) {
  return (
    <span className={clsx('relative inline-flex', className)}>
      <span
        className={clsx(
          'inline-block h-2.5 w-2.5 rounded-full',
          online ? 'bg-emerald-500' : 'bg-slate-300',
        )}
      />
      {online && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      )}
    </span>
  );
}
