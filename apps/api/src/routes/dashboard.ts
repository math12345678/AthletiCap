import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateCAC } from '../services/cacEngine';

const router = Router();
const prisma = new PrismaClient();

// GET /api/dashboard
router.get('/', async (req: Request, res: Response) => {
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

    const athleteId = user.athlete.id;

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: { athleteId },
    });

    const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Get coach contacts
    const contacts = await prisma.coachContact.findMany({
      where: { athleteId },
    });

    // Get offers
    const offers = await prisma.collegeOffer.findMany({
      where: { athleteId },
    });

    const writtenOffers = offers.filter((o) => o.confidenceLevel !== 'SPECULATIVE' && o.confidenceLevel !== 'VERBAL');
    const lowestNetCostOffer =
      writtenOffers.length > 0
        ? writtenOffers.reduce((min, offer) => {
            const netCost = offer.annualCOA - offer.athleticScholarshipPct * offer.annualCOA;
            const minNetCost = min.annualCOA - min.athleticScholarshipPct * min.annualCOA;
            return netCost < minNetCost ? offer : min;
          })
        : null;

    // Get brand readiness
    const brandReadiness = await prisma.brandReadinessScore.findUnique({
      where: { athleteId },
    });

    // Get milestones
    const milestones = await prisma.milestone.findMany({
      where: { athleteId },
      orderBy: { unlockedAt: 'desc' },
      take: 7,
    });

    // Get activity feed (last 10 actions)
    const streakLogs = await prisma.streakLog.findMany({
      where: { athleteId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    // Get CAC
    const cac = await calculateCAC(athleteId);

    // Get streak
    const weekSet = new Set(
      streakLogs.map((l) => {
        const d = new Date(l.date);
        const weekNum = Math.floor((d.getDate() - d.getDay() + 6) / 7);
        return `${weekNum}-${d.getFullYear()}`;
      })
    );

    const today = new Date();
    let streak = 0;
    let week = today;
    while (weekSet.has(Math.floor((week.getDate() - week.getDay() + 6) / 7) + '-' + week.getFullYear())) {
      streak++;
      week = new Date(week.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    res.json({
      athlete: user.athlete,
      totalSpend,
      budgetGoal: user.athlete.budgetGoal,
      contactCount: contacts.length,
      topDivisionTier: contacts.length > 0 ? contacts[0].divisionTier : null,
      lowestNetCostOffer,
      brandReadiness,
      milestones,
      streak,
      recentOffers: offers.slice(0, 2),
      cac,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;
