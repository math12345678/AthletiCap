import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { estimateMeritAid } from '../services/meritAidEngine';
import { project4YearCost } from '../services/projectionEngine';

const router = Router();
const prisma = new PrismaClient();

// GET /api/offers
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

    const offers = await prisma.collegeOffer.findMany({
      where: { athleteId: user.athlete.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// POST /api/offers - create
router.post('/', async (req: Request, res: Response) => {
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

    const {
      schoolName,
      division,
      athleticScholarshipPct,
      meritAidRangeLow,
      meritAidRangeHigh,
      annualCOA,
      coaDataYear,
      tuition,
      roomAndBoard,
      otherFees,
      expectedAnnualContrib,
      isVerbal,
      confidenceLevel,
    } = req.body;

    const offer = await prisma.collegeOffer.create({
      data: {
        athleteId: user.athlete.id,
        schoolName,
        division: division as string,
        athleticScholarshipPct,
        meritAidRangeLow,
        meritAidRangeHigh,
        annualCOA,
        coaDataYear,
        tuition,
        roomAndBoard,
        otherFees,
        expectedAnnualContrib: expectedAnnualContrib || 0,
        isVerbal: isVerbal || false,
        confidenceLevel: (confidenceLevel || 'SPECULATIVE') as string,
      },
    });

    // Check for first offer milestone
    const offerCount = await prisma.collegeOffer.count({
      where: { athleteId: user.athlete.id },
    });

    if (offerCount === 1) {
      await prisma.milestone.create({
        data: {
          athleteId: user.athlete.id,
          type: 'FIRST_OFFER_ADDED',
        },
      });
    }

    res.status(201).json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// PATCH /api/offers/:id
router.patch('/:id', async (req: Request, res: Response) => {
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

    const offer = await prisma.collegeOffer.updateMany({
      where: {
        id: req.params.id,
        athleteId: user.athlete.id,
      },
      data: req.body,
    });

    if (offer.count === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// GET /api/offers/:id/projection - calculate 4-year projection
router.get('/:id/projection', async (req: Request, res: Response) => {
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

    const offer = await prisma.collegeOffer.findUnique({
      where: { id: req.params.id },
    });

    if (!offer || offer.athleteId !== user.athlete.id) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const { coaInflationRate = 0.04 } = req.query;

    const meritAidAverage = (offer.meritAidRangeLow + offer.meritAidRangeHigh) / 2;

    const projections = project4YearCost({
      annualCOA: offer.annualCOA,
      coaInflationRate: parseFloat(coaInflationRate as string),
      athleticScholarshipPct: offer.athleticScholarshipPct,
      meritAidAnnual: offer.meritAidOverride || meritAidAverage,
      expectedAnnualContrib: offer.expectedAnnualContrib,
    });

    res.json(projections);
  } catch (error) {
    console.error('Error calculating projection:', error);
    res.status(500).json({ error: 'Failed to calculate projection' });
  }
});

// GET /api/offers/compare - side-by-side comparison
router.get('/compare', async (req: Request, res: Response) => {
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

    const { ids } = req.query;
    const idArray = (ids as string)?.split(',') || [];

    const offers = await prisma.collegeOffer.findMany({
      where: {
        id: { in: idArray },
        athleteId: user.athlete.id,
      },
    });

    const { coaInflationRate = 0.04 } = req.query;

    const comparisons = offers.map((offer: any) => {
      const meritAidAverage = (offer.meritAidRangeLow + offer.meritAidRangeHigh) / 2;

      const projections = project4YearCost({
        annualCOA: offer.annualCOA,
        coaInflationRate: parseFloat(coaInflationRate as string),
        athleticScholarshipPct: offer.athleticScholarshipPct,
        meritAidAnnual: offer.meritAidOverride || meritAidAverage,
        expectedAnnualContrib: offer.expectedAnnualContrib,
      });

      return {
        offer,
        projections,
      };
    });

    res.json(comparisons);
  } catch (error) {
    console.error('Error comparing offers:', error);
    res.status(500).json({ error: 'Failed to compare offers' });
  }
});

export default router;
