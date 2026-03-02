interface DateSeparatorProps {
  date: string;
}

function formatSeparatorDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="shrink-0 text-xs font-medium text-slate-400">
        {formatSeparatorDate(date)}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
