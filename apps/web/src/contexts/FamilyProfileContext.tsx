import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FamilyProfileData {
  expectedFamilyContribution: number;
  acceptableDebtLevel: number;
  preferredLocations: string[];
  academicPriorities: string[];
  athleticPriorities: string[];
}

interface FamilyProfileContextType {
  familyProfile: FamilyProfileData | null;
  updateFamilyProfile: (data: FamilyProfileData) => void;
  clearFamilyProfile: () => void;
}

const FamilyProfileContext = createContext<FamilyProfileContextType | undefined>(
  undefined
);

export const FamilyProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [familyProfile, setFamilyProfile] = useState<FamilyProfileData | null>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('familyProfile');
    return saved ? JSON.parse(saved) : null;
  });

  // Save to localStorage whenever family profile changes
  useEffect(() => {
    if (familyProfile) {
      localStorage.setItem('familyProfile', JSON.stringify(familyProfile));
    } else {
      localStorage.removeItem('familyProfile');
    }
  }, [familyProfile]);

  const updateFamilyProfile = (data: FamilyProfileData) => {
    setFamilyProfile(data);
  };

  const clearFamilyProfile = () => {
    setFamilyProfile(null);
  };

  return (
    <FamilyProfileContext.Provider
      value={{
        familyProfile,
        updateFamilyProfile,
        clearFamilyProfile,
      }}
    >
      {children}
    </FamilyProfileContext.Provider>
  );
};

export const useFamilyProfile = () => {
  const context = useContext(FamilyProfileContext);
  if (!context) {
    throw new Error('useFamilyProfile must be used within FamilyProfileProvider');
  }
  return context;
};
