import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import Layout from '../components/layout/Layout';
import { useContacts, useExpenses, useOffers } from '../hooks/useApi';
import { Spinner } from '../components/ui/Spinner';

interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'brand' | 'financial' | 'recruitment';
  targetValue: number;
  currentValue: number;
  unit: string;
  icon: string;
  unlockedAt?: Date;
  reward: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  // Brand Milestones
  {
    id: 'brand-1',
    title: 'Social Media Launch',
    description: 'Create profiles on 3 social media platforms',
    category: 'brand',
    targetValue: 3,
    currentValue: 0,
    unit: 'platforms',
    icon: '📱',
    reward: 'Brand Builder Badge',
  },
  {
    id: 'brand-2',
    title: 'First Sponsorship',
    description: 'Secure your first brand partnership',
    category: 'brand',
    targetValue: 1,
    currentValue: 0,
    unit: 'sponsorship',
    icon: '🤝',
    reward: 'Deal Maker Badge',
  },
  {
    id: 'brand-3',
    title: 'Content Creator',
    description: 'Post 10 pieces of content on social media',
    category: 'brand',
    targetValue: 10,
    currentValue: 0,
    unit: 'posts',
    icon: '📸',
    reward: 'Content Master Badge',
  },

  // Financial Milestones
  {
    id: 'financial-1',
    title: 'Budget Beginner',
    description: 'Track your first expense',
    category: 'financial',
    targetValue: 1,
    currentValue: 0,
    unit: 'expense',
    icon: '💰',
    reward: 'Finance Tracker Badge',
  },
  {
    id: 'financial-2',
    title: 'Cost Control',
    description: 'Keep monthly spending under budget target',
    category: 'financial',
    targetValue: 1,
    currentValue: 0,
    unit: 'month',
    icon: '📊',
    reward: 'Budget Master Badge',
  },
  {
    id: 'financial-3',
    title: 'Investment Champion',
    description: 'Track $10,000 in recruitment investments',
    category: 'financial',
    targetValue: 10000,
    currentValue: 0,
    unit: 'dollars',
    icon: '💵',
    reward: 'Investment Pro Badge',
  },

  // Recruitment Milestones
  {
    id: 'recruitment-1',
    title: 'First Contact',
    description: 'Make contact with your first coach',
    category: 'recruitment',
    targetValue: 1,
    currentValue: 0,
    unit: 'contact',
    icon: '✉️',
    reward: 'Outreach Starter Badge',
  },
  {
    id: 'recruitment-2',
    title: 'Offer Collector',
    description: 'Receive 3 college offers',
    category: 'recruitment',
    targetValue: 3,
    currentValue: 0,
    unit: 'offers',
    icon: '🎓',
    reward: 'Offer Magnet Badge',
  },
  {
    id: 'recruitment-3',
    title: 'Recruitment Rockstar',
    description: 'Contact coaches at 10 different schools',
    category: 'recruitment',
    targetValue: 10,
    currentValue: 0,
    unit: 'schools',
    icon: '⭐',
    reward: 'Recruitment Master Badge',
  },
];

interface MilestoneCardProps {
  milestone: Milestone;
  isUnlocked: boolean;
  celebrateUnlock: boolean;
  onShare: () => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  isUnlocked,
  celebrateUnlock,
  onShare,
}) => {
  const progress = (milestone.currentValue / milestone.targetValue) * 100;
  const displayValue = Math.min(milestone.currentValue, milestone.targetValue);

  return (
    <Card
      hoverable
      className={`relative overflow-hidden transition-all ${
        isUnlocked ? 'ring-2 ring-gold-500' : ''
      } ${celebrateUnlock ? 'animate-pulse' : ''}`}
    >
      {celebrateUnlock && (
        <div className="absolute inset-0 bg-gradient-to-t from-gold-500/20 to-transparent pointer-events-none" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{milestone.icon}</span>
          <div>
            <h3 className="font-bold text-text-primary">{milestone.title}</h3>
            <p className="text-sm text-text-secondary">{milestone.description}</p>
          </div>
        </div>
        {isUnlocked && (
          <div className="flex items-center gap-2 bg-gold-500/10 px-3 py-1 rounded-lg">
            <span className="text-gold-500 text-sm font-semibold">Unlocked</span>
            <span className="text-lg">✨</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">Progress</span>
          <span className="text-sm font-semibold text-text-primary">
            {displayValue} / {milestone.targetValue} {milestone.unit}
          </span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isUnlocked ? 'bg-gold-500' : 'bg-teal-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Reward and Share */}
      <div className="flex items-center justify-between pt-3 border-t border-border-color">
        <span className="text-sm text-text-secondary">Reward: {milestone.reward}</span>
        {isUnlocked && (
          <button
            onClick={onShare}
            className="text-sm font-semibold text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1"
          >
            <span>Share</span>
            <span>→</span>
          </button>
        )}
      </div>
    </Card>
  );
};

export const Milestones: React.FC = () => {
  const { data: contactsData, isLoading: contactsLoading } = useContacts();
  const { data: expensesData, isLoading: expensesLoading } = useExpenses();
  const { data: offersData, isLoading: offersLoading } = useOffers();

  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [unlockedMilestones, setUnlockedMilestones] = useState<Set<string>>(new Set());
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Set<string>>(new Set());

  const isLoading = contactsLoading || expensesLoading || offersLoading;

  // Update milestone progress based on API data
  useEffect(() => {
    if (!isLoading && contactsData && expensesData && offersData) {
      const updatedMilestones = milestones.map((milestone) => {
        let currentValue = milestone.currentValue;

        if (milestone.id === 'financial-1') {
          currentValue = expensesData?.length ? 1 : 0;
        } else if (milestone.id === 'financial-3') {
          currentValue = expensesData?.reduce(
            (sum, exp: any) => sum + (exp.amount || 0),
            0
          ) || 0;
        } else if (milestone.id === 'recruitment-1') {
          currentValue = contactsData?.length ? 1 : 0;
        } else if (milestone.id === 'recruitment-2') {
          currentValue = offersData?.length || 0;
        } else if (milestone.id === 'recruitment-3') {
          currentValue = contactsData?.length || 0;
        }

        return { ...milestone, currentValue };
      });

      // Check for newly unlocked milestones
      const newlyUnlocked = new Set<string>();
      updatedMilestones.forEach((milestone) => {
        const isNowUnlocked =
          milestone.currentValue >= milestone.targetValue;
        const wasUnlocked = unlockedMilestones.has(milestone.id);

        if (isNowUnlocked && !wasUnlocked) {
          newlyUnlocked.add(milestone.id);
          setUnlockedMilestones((prev) => new Set([...prev, milestone.id]));
        }
      });

      // Trigger celebration animation for newly unlocked
      if (newlyUnlocked.size > 0) {
        setRecentlyUnlocked(newlyUnlocked);
        const timer = setTimeout(() => setRecentlyUnlocked(new Set()), 2000);
        return () => clearTimeout(timer);
      }

      setMilestones(updatedMilestones);
    }
  }, [contactsData, expensesData, offersData, isLoading]);

  const handleShareMilestone = (milestone: Milestone) => {
    const text = `🎉 I just unlocked the "${milestone.title}" milestone on AthletiCap! ${milestone.icon} #AthletiCap #Recruitment`;
    if (navigator.share) {
      navigator.share({
        title: 'AthletiCap Milestone',
        text: text,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Milestone message copied to clipboard!');
    }
  };

  const categoryMilestones = {
    brand: milestones.filter((m) => m.category === 'brand'),
    financial: milestones.filter((m) => m.category === 'financial'),
    recruitment: milestones.filter((m) => m.category === 'recruitment'),
  };

  const totalMilestones = milestones.length;
  const unlockedCount = unlockedMilestones.size;
  const progressPercentage = (unlockedCount / totalMilestones) * 100;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gold-600/20 to-teal-600/20 rounded-lg p-8 border border-border-bright">
          <h1 className="text-4xl font-bold mb-2 text-text-primary">Milestones</h1>
          <p className="text-text-secondary mb-6">
            Unlock achievements as you progress through your athletic recruiting journey
          </p>

          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-text-primary">
                Overall Progress
              </span>
              <span className="text-lg font-bold text-gold-500">
                {unlockedCount} / {totalMilestones}
              </span>
            </div>
            <div className="w-full bg-bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Sections */}
        <div className="space-y-8">
          {/* Brand Milestones */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <span>📱</span> Brand Milestones
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Build your personal brand and secure sponsorships
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryMilestones.brand.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  isUnlocked={unlockedMilestones.has(milestone.id)}
                  celebrateUnlock={recentlyUnlocked.has(milestone.id)}
                  onShare={() => handleShareMilestone(milestone)}
                />
              ))}
            </div>
          </section>

          {/* Financial Milestones */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <span>💰</span> Financial Milestones
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Master your recruitment budget and track investments
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryMilestones.financial.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  isUnlocked={unlockedMilestones.has(milestone.id)}
                  celebrateUnlock={recentlyUnlocked.has(milestone.id)}
                  onShare={() => handleShareMilestone(milestone)}
                />
              ))}
            </div>
          </section>

          {/* Recruitment Milestones */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <span>🎓</span> Recruitment Milestones
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Progress through your recruiting journey and collect offers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryMilestones.recruitment.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  isUnlocked={unlockedMilestones.has(milestone.id)}
                  celebrateUnlock={recentlyUnlocked.has(milestone.id)}
                  onShare={() => handleShareMilestone(milestone)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Tips Section */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-text-primary">💡 Pro Tips</h3>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex gap-2">
                <span className="text-gold-500 font-bold">•</span>
                <span>Track every contact and expense to unlock financial milestones</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-500 font-bold">•</span>
                <span>Focus on recruiting milestones by actively contacting coaches</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success-500 font-bold">•</span>
                <span>Share your unlocked milestones to celebrate your progress on social media</span>
              </li>
              <li className="flex gap-2">
                <span className="text-warning-500 font-bold">•</span>
                <span>Each milestone unlocked brings you closer to your recruiting goals</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Milestones;
