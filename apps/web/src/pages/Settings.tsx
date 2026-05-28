import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Badge } from '../components/ui';
import { useToast } from '../components/ui';
import { useProfile } from '../contexts/ProfileContext';
import clsx from 'clsx';

export default function Settings() {
  const { addToast } = useToast();
  const { currentProfile, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'about'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    athleteName: '',
    sport: '',
    gradYear: new Date().getFullYear(),
    state: '',
    budgetGoal: 0,
    gpa: undefined as number | undefined,
    sat: undefined as number | undefined,
    act: undefined as number | undefined,
  });

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        athleteName: currentProfile.athleteName || '',
        sport: currentProfile.sport,
        gradYear: currentProfile.gradYear,
        state: currentProfile.state,
        budgetGoal: currentProfile.budgetGoal || 0,
        gpa: currentProfile.gpa,
        sat: currentProfile.sat,
        act: currentProfile.act,
      });
    }
  }, [currentProfile]);

  const handleSave = async () => {
    if (!currentProfile) return;
    setIsSaving(true);
    try {
      await updateProfile({
        athleteName: formData.athleteName,
        sport: formData.sport,
        gradYear: formData.gradYear,
        state: formData.state,
        budgetGoal: formData.budgetGoal,
        gpa: formData.gpa,
        sat: formData.sat,
        act: formData.act,
      });
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (currentProfile) {
      setFormData({
        athleteName: currentProfile.athleteName || '',
        sport: currentProfile.sport,
        gradYear: currentProfile.gradYear,
        state: currentProfile.state,
        budgetGoal: currentProfile.budgetGoal || 0,
        gpa: currentProfile.gpa,
        sat: currentProfile.sat,
        act: currentProfile.act,
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-playfair font-bold text-text-primary mb-2">
            Settings
          </h1>
          <p className="text-text-secondary">
            Manage your account and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border-color overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2',
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-500'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Personal Information" />
              <CardBody className="space-y-4">
                <Input
                  label="Name"
                  value={formData.athleteName}
                  onChange={(e) => setFormData({ ...formData, athleteName: e.target.value })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Sport"
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  />
                  <Input
                    label="Graduation Year"
                    type="number"
                    value={formData.gradYear}
                    onChange={(e) => setFormData({ ...formData, gradYear: parseInt(e.target.value) })}
                  />
                </div>

                <Input
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />

                <Input
                  label="Budget Goal ($)"
                  type="number"
                  value={formData.budgetGoal}
                  onChange={(e) => setFormData({ ...formData, budgetGoal: parseFloat(e.target.value) })}
                />

                <div className="pt-4 border-t border-border-color">
                  <h4 className="font-semibold text-text-primary mb-4">Academic Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="GPA"
                      type="number"
                      step="0.01"
                      value={formData.gpa || ''}
                      onChange={(e) => setFormData({ ...formData, gpa: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                    <Input
                      label="SAT Score"
                      type="number"
                      value={formData.sat || ''}
                      onChange={(e) => setFormData({ ...formData, sat: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                    <Input
                      label="ACT Score"
                      type="number"
                      value={formData.act || ''}
                      onChange={(e) => setFormData({ ...formData, act: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <Button variant="ghost" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  loading={isSaving}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Email Notifications" />
              <CardBody className="space-y-4">
                {[
                  { label: 'New offer received', enabled: true },
                  { label: 'Coach contact milestone', enabled: true },
                  { label: 'Budget threshold reached', enabled: false },
                  { label: 'Social media insights', enabled: true },
                  { label: 'Recruitment tips & news', enabled: false },
                  { label: 'Platform updates', enabled: true },
                ].map((notif) => (
                  <div key={notif.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-elevated">
                    <span className="text-text-primary">{notif.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={notif.enabled}
                      className="h-5 w-5 cursor-pointer"
                    />
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="About AthletiCap" />
              <CardBody className="space-y-4">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Version</h3>
                  <p className="text-text-secondary">AthletiCap v1.0.0</p>
                </div>

                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Description</h3>
                  <p className="text-text-secondary">
                    AthletiCap is a comprehensive financial and recruitment tracking platform for student athletes. Track your spending, manage coach contacts, compare college offers, and monitor your brand growth—all in one place.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Features</h3>
                  <ul className="text-text-secondary space-y-1">
                    <li>💰 Recruitment expense tracking with CAC analysis</li>
                    <li>📞 Coach contact management and follow-up</li>
                    <li>💼 College offer comparison and financial projections</li>
                    <li>⭐ Brand readiness scoring and social media tracking</li>
                    <li>📊 Advanced analytics and insights</li>
                    <li>🎯 Milestone tracking and achievement badges</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Terms & Privacy</h3>
                  <div className="space-y-2">
                    <Button size="sm" variant="ghost">
                      Terms of Service
                    </Button>
                    <Button size="sm" variant="ghost">
                      Privacy Policy
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
