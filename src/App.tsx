import React from 'react';
import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { WeightTracker } from './pages/WeightTracker';
import { NutritionLog } from './pages/NutritionLog';
import { Goals } from './pages/Goals';
import { Analytics } from './pages/Analytics';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', padding: '2rem', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Something went wrong</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{(this.state.error as Error).message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
