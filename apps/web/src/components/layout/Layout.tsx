import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../../hooks';
import { useProfile } from '../../contexts/ProfileContext';
import { Button } from '../ui';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Mission Control', path: '/', icon: '📊', category: 'main', breadcrumb: 'DASHBOARD' },
  { label: 'Recruitment CapEx', path: '/tracker', icon: '📝', category: 'main', breadcrumb: 'EXPENSES' },
  { label: 'Coach Intelligence', path: '/contacts', icon: '👥', category: 'main', breadcrumb: 'CONTACTS' },
  { label: 'School Offers', path: '/offers', icon: '💰', category: 'planning', breadcrumb: 'OFFERS' },
  { label: 'School Matcher', path: '/school-matcher', icon: '🎓', category: 'planning', breadcrumb: 'MATCHER' },
  { label: 'Budget Advisor', path: '/budget-advisor', icon: '💡', category: 'planning', breadcrumb: 'BUDGET' },
  { label: 'Milestones', path: '/milestones', icon: '🎯', category: 'planning', breadcrumb: 'MILESTONES' },
  { label: 'Settings', path: '/settings', icon: '⚙️', category: 'account', breadcrumb: 'SETTINGS' },
];

const categories = {
  main: 'Financial Tools',
  planning: 'Analysis & Planning',
  account: 'Account',
};

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { currentProfile, clearProfile } = useProfile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path: string) => {
    if (path.includes('?')) {
      return location.pathname === path.split('?')[0] && location.search === `?${path.split('?')[1]}`;
    }
    return location.pathname === path;
  };

  const getCurrentBreadcrumb = () => {
    const current = navItems.find((item) => isActive(item.path));
    return current?.breadcrumb || 'DASHBOARD';
  };

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    await clearProfile();
    // Navigate with state indicating we're logging out
    navigate('/profile', { state: { isLogout: true } });
  };

  const handleSwitchProfile = async () => {
    await clearProfile();
    // Navigate with state indicating we're switching profiles
    navigate('/profile', { state: { isSwitching: true } });
  };

  // Group nav items by category
  const groupedNav = Object.entries(categories).map(([ categoryKey, categoryLabel ]) => ({
    label: categoryLabel,
    items: navItems.filter((item) => item.category === categoryKey),
  }));

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col md:flex-row">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-[#F4F3EF] border-b border-[#D8D5CC] px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-serif text-[#1A56DB] font-bold">AthletiCap</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#FFFFFF] rounded-sm transition-colors"
          >
            <svg className="h-6 w-6 text-[#1A1916]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </header>
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'bg-[#F4F3EF] border-r border-[#D8D5CC] flex flex-col transition-all duration-300 fixed md:relative md:translate-x-0 h-screen md:h-auto',
          isMobile && sidebarOpen ? 'translate-x-0 w-64 z-40' : 'translate-x-full md:translate-x-0',
          !isMobile && 'w-72'
        )}
      >
        {/* Logo */}
        {!isMobile && (
          <div className="p-6 border-b border-[#D8D5CC]">
            <h1 className="text-2xl font-serif text-[#1A56DB] font-bold">AthletiCap</h1>
            <p className="text-xs text-[#5C5A54] mt-1">Recruitment Intelligence Platform</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-8 overflow-y-auto">
          {groupedNav.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-semibold text-[#5C5A54] uppercase tracking-wider mb-3 px-2">
                {group.label}
              </h2>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={clsx(
                      'w-full text-left px-4 py-3 rounded-sm transition-all duration-200 flex items-center gap-3 font-medium text-sm',
                      isActive(item.path)
                        ? 'bg-[#1A56DB] text-white'
                        : 'text-[#5C5A54] hover:text-[#1A1916] hover:bg-[#FFFFFF]'
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-[#D8D5CC] space-y-3">
          {currentProfile && (
            <button
              onClick={handleSwitchProfile}
              className="w-full text-left text-xs text-[#5C5A54] hover:text-[#1A1916] transition-colors px-2 py-2 hover:bg-[#FFFFFF] rounded-sm"
            >
              <p className="font-semibold text-[#1A1916]">{currentProfile.athleteName}</p>
              <p className="text-[#8A8783]">{currentProfile.gradYear} • {currentProfile.sport}</p>
            </button>
          )}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSwitchProfile}
              className="flex-1 px-3 py-2 border border-[#D8D5CC] text-[#1A1916] text-xs font-medium rounded-sm hover:bg-[#FFFFFF] transition-colors"
            >
              Profiles
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-3 py-2 border border-[#D8D5CC] text-[#1A1916] text-xs font-medium rounded-sm hover:bg-[#FFFFFF] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1A1916] bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Header (Desktop) */}
        {!isMobile && (
          <header className="bg-[#FFFFFF] border-b border-[#D8D5CC] px-8 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-mono text-[#5C5A54]">
                <span>ROOT</span>
                <span>/</span>
                <span className="text-[#1A1916] font-semibold">{getCurrentBreadcrumb()}</span>
              </div>
              <div className="flex items-center gap-4 relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-[#F4F3EF] rounded-sm transition-colors relative"
                  title="Notifications"
                >
                  <svg className="h-5 w-5 text-[#5C5A54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 h-2 w-2 bg-[#1A56DB] rounded-full" />
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-[#FFFFFF] border border-[#D8D5CC] rounded-sm shadow-lg z-50">
                    <div className="p-4 border-b border-[#D8D5CC]">
                      <h3 className="text-sm font-semibold text-[#1A1916]">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 text-center text-[#8A8783] text-sm">
                        No new notifications
                      </div>
                    </div>
                  </div>
                )}

                {/* Close notifications when clicking outside */}
                {showNotifications && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#5C5A54] tracking-widest">ATHLETE PROFILE</p>
              <p className="text-lg text-[#1A1916] font-serif font-bold mt-1">
                {currentProfile ? currentProfile.athleteName : 'Athlete'}
              </p>
            </div>
          </header>
        )}

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
