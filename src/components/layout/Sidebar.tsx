import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Scale,
  UtensilsCrossed,
  Target,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '../../store';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/weight', icon: Scale, label: 'Weight' },
  { to: '/nutrition', icon: UtensilsCrossed, label: 'Nutrition' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar() {
  const streaks = useAppStore((s) => s.streaks);

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            F
          </div>
          <span className="font-semibold text-gray-800 text-sm">Fat Tracker</span>
        </div>
        {streaks.currentWeighInStreak > 0 && (
          <div className="mt-2 text-xs text-orange-500 font-medium flex items-center gap-1">
            🔥 {streaks.currentWeighInStreak}-day streak
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
        Data saved locally
      </div>
    </aside>
  );
}
