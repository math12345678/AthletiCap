import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui';
import { api, setAuthToken } from './lib/api';

import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Offers from './pages/Offers';
import Influence from './pages/Influence';
import Login from './pages/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-bg-primary">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-gold border-t-transparent mb-6" />
        <div className="text-4xl font-playfair text-gold mb-4">AthletiCap</div>
        <p className="text-text-secondary text-sm">Initializing your dashboard...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthTokenState] = useState<string | null>(
    localStorage.getItem('authToken')
  );

  useEffect(() => {
    // Demo mode: use demo user
    const demoToken = 'user_rodriguez_athlete_demo';
    setAuthTokenState(demoToken);
    setAuthToken(demoToken);
    localStorage.setItem('authToken', demoToken);

    // Simulate loading user
    setTimeout(() => {
      setUser({ id: demoToken, email: 'athlete@rodriguez.family' });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/influence" element={<Influence />} />
            <Route path="/analytics" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/milestones" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/settings" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
