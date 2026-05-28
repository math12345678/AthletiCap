import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui';
import { api, setAuthToken } from './lib/api';
import { ProfileProvider, useProfile } from './contexts/ProfileContext';

import Onboarding from './pages/Onboarding';
import DashboardV2 from './pages/DashboardV2';
import ExpensesV2 from './pages/ExpensesV2';
import ContactsV2 from './pages/ContactsV2';
import OffersV2 from './pages/OffersV2';
import SchoolMatcher from './pages/SchoolMatcher';
import BudgetAdvisor from './pages/BudgetAdvisor';
import MilestonesV2 from './pages/MilestonesV2';
import Settings from './pages/Settings';
import ProfileSetup from './pages/ProfileSetup';
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
    <div className="flex items-center justify-center h-screen bg-[#FAFAF8]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[#1A56DB] border-t-transparent mb-6" />
        <div className="text-4xl font-serif font-bold text-[#1A56DB] mb-4">AthletiCap</div>
        <p className="text-[#5C5A54] text-sm">Initializing your dashboard...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { currentProfile, isLoading: profileLoading } = useProfile();

  if (profileLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Profile setup routes */}
      <Route path="/profile" element={<ProfileSetup />} />

      {/* If no profile, show profile setup for all other routes */}
      {!currentProfile ? (
        <>
          <Route path="*" element={<ProfileSetup />} />
        </>
      ) : (
        <>
          <Route path="/" element={<DashboardV2 />} />
          <Route path="/tracker" element={<ExpensesV2 />} />
          <Route path="/contacts" element={<ContactsV2 />} />
          <Route path="/offers" element={<OffersV2 />} />
          <Route path="/milestones" element={<MilestonesV2 />} />
          <Route path="/school-matcher" element={<SchoolMatcher />} />
          <Route path="/budget-advisor" element={<BudgetAdvisor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
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
    const demoToken = 'user_demo_athlete';
    setAuthTokenState(demoToken);
    setAuthToken(demoToken);
    localStorage.setItem('authToken', demoToken);

    // Simulate loading user
    setTimeout(() => {
      setUser({ id: demoToken, email: 'athlete@demo.local' });
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
          <ProfileProvider>
            <AppRoutes />
          </ProfileProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
