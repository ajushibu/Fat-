import { formatDate, todayStr } from '../../utils/dateUtils';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="text-sm text-gray-500">{formatDate(todayStr(), 'EEEE, MMMM d, yyyy')}</div>
    </header>
  );
}
