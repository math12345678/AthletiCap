import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateCAC } from '../services/cacEngine.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/contacts
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

    const contacts = await prisma.coachContact.findMany({
      where: { athleteId: user.athlete.id },
      orderBy: { contactDate: 'desc' },
    });

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// POST /api/contacts - create
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
      coachName,
      coachEmail,
      contactType,
      divisionTier,
      contactDate,
      notes,
      isVerbal,
    } = req.body;

    const contact = await prisma.coachContact.create({
      data: {
        athleteId: user.athlete.id,
        schoolName,
        coachName,
        coachEmail,
        contactType: contactType as string,
        divisionTier,
        contactDate: new Date(contactDate),
        notes,
        isVerbal: isVerbal || false,
      },
    });

    // Log streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.streakLog.findFirst({
      where: {
        athleteId: user.athlete.id,
        date: today,
      },
    });

    if (!existingLog) {
      await prisma.streakLog.create({
        data: {
          athleteId: user.athlete.id,
          date: today,
          action: 'contact_logged',
        },
      });
    }

    // Check for first reply milestone
    if (contactType === 'REPLY_RECEIVED') {
      const existingMilestone = await prisma.milestone.findFirst({
        where: {
          athleteId: user.athlete.id,
          type: 'FIRST_COACH_REPLY',
        },
      });

      if (!existingMilestone) {
        await prisma.milestone.create({
          data: {
            athleteId: user.athlete.id,
            type: 'FIRST_COACH_REPLY',
            metadata: JSON.stringify({
              coachName,
              school: schoolName,
            }),
          },
        });
      }
    }

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// GET /api/contacts/cac - quality-weighted CAC report
router.get('/cac', async (req: Request, res: Response) => {
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

    const cacResult = await calculateCAC(user.athlete.id);
    res.json(cacResult);
  } catch (error) {
    console.error('Error calculating CAC:', error);
    res.status(500).json({ error: 'Failed to calculate CAC' });
  }
});

export default router;
