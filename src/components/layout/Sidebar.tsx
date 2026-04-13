import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Scale, UtensilsCrossed, Target, BarChart3, Flame } from 'lucide-react';
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
    <aside className="w-52 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
            <Scale size={15} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-gray-900 text-sm">Fat Tracker</span>
            {streaks.currentWeighInStreak > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Flame size={11} className="text-orange-400" />
                <span className="text-[11px] text-orange-400 font-medium">{streaks.currentWeighInStreak}-day streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-gray-50 text-[11px] text-gray-300 text-center">
        All data stored locally
      </div>
    </aside>
  );
}
