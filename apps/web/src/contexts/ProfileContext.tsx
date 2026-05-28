import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface AthleteProfile {
  id: number;
  userId: string;
  role: 'athlete' | 'parent' | 'consultant';
  sport: string;
  gradYear: number;
  state: string;
  budgetGoal?: number;
  gpa?: number;
  sat?: number;
  act?: number;
  testOptional?: boolean;
  athleteName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProfileInput {
  role: 'athlete' | 'parent' | 'consultant';
  sport: string;
  gradYear: number;
  state: string;
  budgetGoal?: number;
  gpa?: number;
  sat?: number;
  act?: number;
  testOptional?: boolean;
  athleteName?: string;
}

interface ProfileContextType {
  currentProfile: AthleteProfile | null;
  createProfile: (profile: CreateProfileInput) => Promise<AthleteProfile>;
  updateProfile: (updates: Partial<CreateProfileInput>) => Promise<AthleteProfile>;
  clearProfile: () => void;
  isLoading: boolean;
  error: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState<AthleteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile from backend API on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profile = await api.profile.get();
        setCurrentProfile(profile);
      } catch (err) {
        // 404 is expected when user hasn't created a profile yet
        const errorMsg = (err as Error).message;
        if (!errorMsg.includes('404') && !errorMsg.includes('not found')) {
          console.error('Failed to load profile:', err);
          setError(errorMsg);
        }
        setCurrentProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const createProfile = async (
    profileData: CreateProfileInput
  ): Promise<AthleteProfile> => {
    try {
      setError(null);
      const profile = await api.profile.create(profileData);
      setCurrentProfile(profile);
      return profile;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      throw err;
    }
  };

  const updateProfile = async (
    updates: Partial<CreateProfileInput>
  ): Promise<AthleteProfile> => {
    try {
      setError(null);
      const profile = await api.profile.update(updates);
      setCurrentProfile(profile);
      return profile;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      throw err;
    }
  };

  const clearProfile = () => {
    setCurrentProfile(null);
    setError(null);
  };

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        createProfile,
        updateProfile,
        clearProfile,
        isLoading,
        error,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};
