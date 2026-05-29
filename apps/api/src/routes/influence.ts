import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateBrandReadiness } from '../services/brandReadinessEngine';
const nilStateRules = require('../data/nil_state_rules.json');

const router = Router();
const prisma = new PrismaClient();

function calculateAge(birthDate: Date | null): number {
  if (!birthDate) return 18;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// GET /api/influence/brand-readiness
router.get('/brand-readiness', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { athlete: true },
    });

    if (!user?.athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const result = await calculateBrandReadiness(user.athlete.id);

    // Save to database
    await prisma.brandReadinessScore.upsert({
      where: { athleteId: user.athlete.id },
      update: {
        score: result.score,
        tier: result.tier,
        followersNeeded: result.followersNeeded,
        engagementTarget: result.engagementTarget,
        checklistJson: JSON.stringify(result.checklist),
      },
      create: {
        athleteId: user.athlete.id,
        score: result.score,
        tier: result.tier,
        followersNeeded: result.followersNeeded,
        engagementTarget: result.engagementTarget,
        checklistJson: JSON.stringify(result.checklist),
      },
    });

    res.json(result);
  } catch (error) {
    console.error('Error calculating brand readiness:', error);
    res.status(500).json({ error: 'Failed to calculate brand readiness' });
  }
});

// GET /api/influence/eligibility
router.get('/eligibility', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { athlete: true },
    });

    if (!user?.athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const age = calculateAge(user.birthDate);
    const stateRule = (nilStateRules as any)[user.stateCode];

    const eligibility = {
      age,
      stateCode: user.stateCode,
      statePermitted: stateRule?.permitted || false,
      parentConsentGiven: user.parentConsent,
      eligible: age >= 18 || (user.parentConsent && stateRule?.permitted),
      disclosureAcknowledged: user.athlete.influenceDisclosureAcknowledged,
    };

    res.json(eligibility);
  } catch (error) {
    console.error('Error fetching eligibility:', error);
    res.status(500).json({ error: 'Failed to fetch eligibility' });
  }
});

// POST /api/influence/acknowledge-disclosure
router.post('/acknowledge-disclosure', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { athlete: true },
    });

    if (!user?.athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    await prisma.athlete.update({
      where: { id: user.athlete.id },
      data: { influenceDisclosureAcknowledged: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error acknowledging disclosure:', error);
    res.status(500).json({ error: 'Failed to acknowledge disclosure' });
  }
});

// GET /api/influence/social-profiles
router.get('/social-profiles', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { athlete: true },
    });

    if (!user?.athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const profiles = await prisma.socialProfile.findMany({
      where: { athleteId: user.athlete.id },
    });

    res.json(profiles);
  } catch (error) {
    console.error('Error fetching social profiles:', error);
    res.status(500).json({ error: 'Failed to fetch social profiles' });
  }
});

// POST /api/influence/social-profiles - create social profile
router.post('/social-profiles', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { athlete: true },
    });

    if (!user?.athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const { platform, handle, followerCount, avgEngagementRate, monthlyGrowthRate } = req.body;

    const profile = await prisma.socialProfile.create({
      data: {
        athleteId: user.athlete.id,
        platform,
        handle,
        followerCount: followerCount || 0,
        avgEngagementRate: avgEngagementRate || 0,
        monthlyGrowthRate: monthlyGrowthRate || 0,
        lastRefreshed: new Date(),
      },
    });

    // Check for social connected milestone
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        athleteId: user.athlete.id,
        type: 'SOCIAL_CONNECTED',
      },
    });

    if (!existingMilestone) {
      await prisma.milestone.create({
        data: {
          athleteId: user.athlete.id,
          type: 'SOCIAL_CONNECTED',
        },
      });
    }

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating social profile:', error);
    res.status(500).json({ error: 'Failed to create social profile' });
  }
});

export default router;
