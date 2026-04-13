import { NavLink, useMatch, useResolvedPath } from 'react-router-dom';
import { LayoutDashboard, Scale, UtensilsCrossed, Target, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/weight', icon: Scale, label: 'Weight' },
  { to: '/nutrition', icon: UtensilsCrossed, label: 'Nutrition' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

function NavItem({ to, icon: Icon, label, end }: { to: string; icon: LucideIcon; label: string; end?: boolean }) {
  const resolved = useResolvedPath(to);
  const isActive = !!useMatch({ path: resolved.pathname, end: end ?? false });

  return (
    <NavLink
      to={to}
      end={end}
      className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
        isActive ? 'text-emerald-600' : 'text-gray-400'
      }`}
    >
      <span className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-emerald-50' : ''}`}>
        <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
      </span>
      {label}
    </NavLink>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 flex pb-safe">
      {NAV.map(({ to, icon, label }) => (
        <NavItem key={to} to={to} icon={icon} label={label} end={to === '/'} />
      ))}
    </nav>
  );
}
