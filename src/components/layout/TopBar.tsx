interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
      <div>
        <h1 className="text-base md:text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
