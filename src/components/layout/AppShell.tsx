import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useStreakCalc } from '../../hooks/useStreakCalc';

export function AppShell() {
  useStreakCalc(); // background streak/milestone computation

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
