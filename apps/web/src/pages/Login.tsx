import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    localStorage.setItem('authToken', 'user_rodriguez_athlete_demo');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-playfair text-gold mb-2">AthletiCap</h1>
          <p className="text-text-secondary">Recruitment Finance Intelligence</p>
        </div>

        <div className="card space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Welcome Back</h2>
            <p className="text-text-secondary text-sm">
              Sign in to manage your recruitment finances
            </p>
          </div>

          <button
            onClick={handleDemoLogin}
            className="btn-primary w-full"
          >
            Demo Login (Rodriguez Family)
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border border-border-color" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-secondary text-text-muted">Or continue with</span>
            </div>
          </div>

          <button className="btn-secondary w-full">Sign in with Clerk</button>

          <div className="text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <a href="#" className="text-gold hover:text-yellow">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
