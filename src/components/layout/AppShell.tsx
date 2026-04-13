import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useStreakCalc } from '../../hooks/useStreakCalc';

export function AppShell() {
  useStreakCalc();

  return (
    <div className="flex h-dvh bg-gray-50 overflow-hidden">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
