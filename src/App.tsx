import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { WeightTracker } from './pages/WeightTracker';
import { NutritionLog } from './pages/NutritionLog';
import { Goals } from './pages/Goals';
import { Analytics } from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="weight" element={<WeightTracker />} />
          <Route path="nutrition" element={<NutritionLog />} />
          <Route path="goals" element={<Goals />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
