import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../../hooks';
import { Button } from '../ui';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/', icon: '📊', category: 'main' },
  { label: 'Tracker', path: '/tracker', icon: '📝', category: 'main' },
  { label: 'Offers', path: '/offers', icon: '💰', category: 'main' },
  { label: 'Brand', path: '/influence', icon: '⭐', category: 'main' },
  { label: 'Analytics', path: '/analytics', icon: '📈', category: 'tools' },
  { label: 'Milestones', path: '/milestones', icon: '🎯', category: 'tools' },
  { label: 'Settings', path: '/settings', icon: '⚙️', category: 'account' },
];

const categories = {
  main: 'Core Features',
  tools: 'Tools',
  account: 'Account',
};

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Group nav items by category
  const groupedNav = Object.entries(categories).map(([ categoryKey, categoryLabel ]) => ({
    label: categoryLabel,
    items: navItems.filter((item) => item.category === categoryKey),
  }));

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-bg-secondary border-b border-border-color px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-playfair text-gold font-bold">AthletiCap</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          'bg-bg-secondary border-r border-border-color flex flex-col transition-all duration-300 fixed md:relative md:translate-x-0 h-screen md:h-auto',
          isMobile && sidebarOpen ? 'translate-x-0 w-64 z-40' : 'translate-x-full md:translate-x-0',
          !isMobile && 'w-72'
        )}
      >
        {/* Logo */}
        {!isMobile && (
          <div className="p-6 border-b border-border-color">
            <h1 className="text-2xl font-playfair text-gold font-bold">AthletiCap</h1>
            <p className="text-xs text-text-secondary mt-1">Financial Dashboard for Athletes</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-8 overflow-y-auto">
          {groupedNav.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 px-2">
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
                      'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium',
                      isActive(item.path)
                        ? 'bg-gold text-bg-primary shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
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
        <div className="p-6 border-t border-border-color space-y-3">
          <div className="text-xs text-text-secondary px-2 py-2">
            <p className="font-semibold text-text-primary">Sofia Rodriguez</p>
            <p className="text-text-muted">17 • Athlete</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Header (Desktop) */}
        {!isMobile && (
          <header className="bg-bg-secondary border-b border-border-color px-8 py-6 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h2 className="text-sm text-text-secondary font-medium">Welcome back</h2>
              <p className="text-xl text-text-primary font-playfair font-bold">Sofia Rodriguez</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-bg-elevated rounded-lg transition-colors relative">
                <svg className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 h-2 w-2 bg-gold rounded-full" />
              </button>
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
