import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, CreateProfileInput } from '../contexts/ProfileContext';
import { useFamilyProfile } from '../contexts/FamilyProfileContext';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardBody, CardFooter, Button, Loader } from '../components/ui';
import { api } from '../lib/api';

const profileSchema = z.object({
  athleteName: z.string().min(1, 'Name is required'),
  role: z.enum(['athlete', 'parent', 'consultant']),
  sport: z.string().min(1, 'Sport is required'),
  gradYear: z.number().min(2024, 'Graduation year must be 2024 or later').max(2035, 'Invalid graduation year'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  budgetGoal: z.number().nullable().optional(),
  gpa: z.number().nullable().optional(),
  sat: z.number().nullable().optional(),
  act: z.number().nullable().optional(),
  testOptional: z.boolean().optional(),
}).refine(
  (data) => {
    // If gpa or sat/act are provided, at least one test score should be there
    return true; // Allow submission even with incomplete academic data
  },
  { message: 'Please provide complete academic information or leave all blank' }
);

type ProfileFormData = z.infer<typeof profileSchema>;

const SPORTS = [
  'basketball',
  'football',
  'soccer',
  'volleyball',
  'baseball',
  'softball',
  'tennis',
  'track',
  'swimming',
  'cross-country',
  'lacrosse',
  'golf',
  'other',
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProfile, createProfile, updateProfile, clearProfile, reloadProfile, isLoading: contextLoading, error: contextError } = useProfile();
  const { updateFamilyProfile } = useFamilyProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSwitchMode, setShowSwitchMode] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // When navigating to /profile from the app, it's for profile switching
  useEffect(() => {
    // Check the location state to determine if we're switching or setting up
    const state = location.state as { isSwitching?: boolean; isLogout?: boolean } | null;

    if (state?.isSwitching) {
      // User clicked "Profiles" button - show switch mode
      setShowSwitchMode(true);
    } else if (state?.isLogout) {
      // User clicked "Sign Out" button - show setup mode
      setShowSwitchMode(false);
    } else {
      // Direct navigation or page reload - use currentProfile to determine mode
      if (currentProfile) {
        setShowSwitchMode(true);
      } else {
        setShowSwitchMode(false);
      }
    }
  }, [location]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: 'athlete',
      gradYear: new Date().getFullYear() + 1,
      testOptional: false,
    },
  });

  const showAdvancedFields = watch('role') === 'athlete';

  const handleLoadDemo = async () => {
    try {
      setIsLoadingDemo(true);
      setSubmitError(null);

      // Call the load demo endpoint
      const response = await api.profile.loadDemo();

      // If family profile is returned, save it
      if (response && response.familyProfile) {
        updateFamilyProfile(response.familyProfile);
      }

      // Reload profile context to get the newly created demo profile
      await reloadProfile();

      // Demo profile loaded successfully, navigate to dashboard
      navigate('/');
    } catch (err) {
      const errorMsg = (err as Error).message;
      setSubmitError(errorMsg || 'Failed to load demo profile. Please try again.');
      console.error('Demo profile load error:', err);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const profileInput: CreateProfileInput = {
        athleteName: data.athleteName,
        role: data.role,
        sport: data.sport,
        gradYear: data.gradYear,
        state: data.state,
        budgetGoal: data.budgetGoal ? parseFloat(data.budgetGoal.toString()) : undefined,
        gpa: data.gpa ? parseFloat(data.gpa.toString()) : undefined,
        sat: data.sat ? parseInt(data.sat.toString()) : undefined,
        act: data.act ? parseInt(data.act.toString()) : undefined,
        testOptional: data.testOptional,
      };

      // If in switch mode (isSwitching flag from location state), always update
      // because we navigated here to modify the existing profile
      if (showSwitchMode) {
        await updateProfile(profileInput);
      } else {
        await createProfile(profileInput);
      }

      // Profile created/updated successfully, navigate to dashboard
      navigate('/');
    } catch (err) {
      const errorMsg = (err as Error).message;
      setSubmitError(errorMsg || 'Failed to save profile. Please try again.');
      console.error('Profile save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (contextLoading) {
    return (
      <Layout>
        <Loader fullscreen label="Loading profile..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-playfair font-bold text-text-primary mb-2">
              {showSwitchMode ? 'Switch Profile' : 'Welcome to AthletiCap'}
            </h1>
            <p className="text-lg text-text-secondary">
              {showSwitchMode ? 'Create or select a different athlete profile' : 'Set up your profile to get started with recruitment tracking'}
            </p>
          </div>
          {showSwitchMode && (
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-[#D8D5CC] text-[#1A1916] text-sm font-medium rounded-sm hover:bg-[#F4F3EF] transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </div>

        <Card>
          <CardHeader title="Create Your Profile" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardBody className="space-y-6">
              {(submitError || contextError) && (
                <div className="p-4 bg-error-500/10 border border-error-500/50 rounded-lg">
                  <p className="text-error-600 text-sm">{submitError || contextError}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Smith"
                  {...register('athleteName')}
                  className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                {errors.athleteName && (
                  <p className="text-error-600 text-sm mt-1">{errors.athleteName.message}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  I am a: *
                </label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="athlete">Student Athlete</option>
                  <option value="parent">Parent</option>
                  <option value="consultant">Recruiting Consultant</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sport */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Sport *
                  </label>
                  <select
                    {...register('sport')}
                    className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">Select a sport</option>
                    {SPORTS.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.sport && (
                    <p className="text-error-600 text-sm mt-1">{errors.sport.message}</p>
                  )}
                </div>

                {/* Graduation Year */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    min="2024"
                    max="2035"
                    {...register('gradYear', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  {errors.gradYear && (
                    <p className="text-error-600 text-sm mt-1">{errors.gradYear.message}</p>
                  )}
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  State *
                </label>
                <select
                  {...register('state')}
                  className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">Select a state</option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-error-600 text-sm mt-1">{errors.state.message}</p>
                )}
              </div>

              {/* Budget Goal */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Budget Goal (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-text-secondary">$</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    placeholder="10000"
                    {...register('budgetGoal', {
                      valueAsNumber: true,
                      setValueAs: (val) => val === '' || isNaN(val) ? undefined : val
                    })}
                    className="w-full pl-8 pr-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Academic Info (Athletes Only) */}
              {showAdvancedFields && (
                <>
                  <div className="pt-4 border-t border-border-color">
                    <h3 className="font-semibold text-text-primary mb-4">
                      Academic Profile (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* GPA */}
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                          GPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          placeholder="3.8"
                          {...register('gpa', {
                            valueAsNumber: true,
                            setValueAs: (val) => val === '' || isNaN(val) ? undefined : val
                          })}
                          className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                        />
                      </div>

                      {/* SAT */}
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                          SAT Score
                        </label>
                        <input
                          type="number"
                          step="10"
                          min="400"
                          max="1600"
                          placeholder="1400"
                          {...register('sat', {
                            valueAsNumber: true,
                            setValueAs: (val) => val === '' || isNaN(val) ? undefined : val
                          })}
                          className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                        />
                      </div>

                      {/* ACT */}
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                          ACT Score
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          max="36"
                          placeholder="32"
                          {...register('act', {
                            valueAsNumber: true,
                            setValueAs: (val) => val === '' || isNaN(val) ? undefined : val
                          })}
                          className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                        />
                      </div>

                      {/* Test Optional */}
                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...register('testOptional')}
                            className="w-5 h-5 rounded border-border-color bg-bg-primary cursor-pointer"
                          />
                          <span className="ml-3 text-sm font-medium text-text-primary">
                            Test Optional School
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardBody>

            <CardFooter className="flex flex-col gap-4">
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => navigate('/')} disabled={isSubmitting || isLoadingDemo}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  loadingText="Creating profile..."
                  disabled={isSubmitting || isLoadingDemo}
                >
                  Create Profile
                </Button>
              </div>

              {!showSwitchMode && (
                <div className="pt-4 border-t border-[#D8D5CC]">
                  <p className="text-sm text-[#8A8783] mb-3">Want to see it in action?</p>
                  <Button
                    variant="outline"
                    onClick={handleLoadDemo}
                    loading={isLoadingDemo}
                    loadingText="Loading demo profile..."
                    disabled={isLoadingDemo || isSubmitting}
                    className="w-full"
                  >
                    Load Demo Profile
                  </Button>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileSetup;
