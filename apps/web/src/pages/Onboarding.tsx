import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-playfair text-gold mb-8">Complete Your Profile</h1>
        <div className="card">
          <p className="text-text-secondary mb-6">Onboarding flow goes here...</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
