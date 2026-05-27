import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <div className="w-64 bg-bg-secondary border-r border-border-color flex flex-col">
        <div className="p-6 border-b border-border-color">
          <h1 className="text-2xl font-playfair text-gold">AthletiCap</h1>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { label: 'Dashboard', path: '/', icon: '📊' },
            { label: 'Tracker', path: '/tracker', icon: '📝' },
            { label: 'Offers', path: '/offers', icon: '💰' },
            { label: 'Brand Analytics', path: '/influence', icon: '📈' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-gold text-bg-primary font-semibold'
                  : 'text-text-secondary hover:bg-bg-elevated'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-border-color">
          <button
            onClick={() => {
              localStorage.removeItem('authToken');
              navigate('/login');
            }}
            className="btn-secondary w-full text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );
}
