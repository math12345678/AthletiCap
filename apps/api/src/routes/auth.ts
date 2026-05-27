import { Router, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/webhook - Clerk webhook for new user
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (type === 'user.created') {
      const { id, email_addresses, created_at } = data;

      const email = email_addresses[0]?.email_address;

      if (!email) {
        return res.status(400).json({ error: 'No email found' });
      }

      // Create user in database
      const user = await prisma.user.upsert({
        where: { clerkId: id },
        update: {},
        create: {
          clerkId: id,
          email,
          role: 'ATHLETE',
        },
      });

      res.json({ success: true, user });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/auth/me - Current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        athlete: true,
        parent: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/auth/onboarding - Complete onboarding
router.post('/onboarding', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      role,
      firstName,
      lastName,
      birthDate,
      sport,
      gradYear,
      gpa,
      actScore,
      satScore,
      stateCode,
      budgetGoal,
    } = req.body;

    // Update user
    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        role: role as Role,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        stateCode,
      },
    });

    if (role === 'ATHLETE') {
      // Create or update athlete
      const athlete = await prisma.athlete.upsert({
        where: { userId: user.id },
        update: {
          firstName,
          lastName,
          sport,
          gradYear,
          gpa,
          actScore,
          satScore,
          budgetGoal,
        },
        create: {
          userId: user.id,
          firstName,
          lastName,
          sport,
          gradYear,
          gpa,
          actScore,
          satScore,
          budgetGoal,
        },
      });

      // Create first milestone
      await prisma.milestone.create({
        data: {
          athleteId: athlete.id,
          type: 'CONSENT_CONFIRMED',
        },
      });

      res.json({ success: true, athlete });
    } else if (role === 'PARENT') {
      // Create parent
      const parent = await prisma.parent.upsert({
        where: { userId: user.id },
        update: { firstName, lastName },
        create: { userId: user.id, firstName, lastName },
      });

      res.json({ success: true, parent });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Onboarding failed' });
  }
});

export default router;
