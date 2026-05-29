import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateCAC } from '../services/cacEngine';

const router = Router();
const prisma = new PrismaClient();

// GET /api/expenses - list with pagination
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

    const { skip = '0', take = '25', category, fromDate, toDate } = req.query;

    const where: any = { athleteId: user.athlete.id };

    if (category) {
      where.category = category as string;
    }

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate as string);
      if (toDate) where.date.lte = new Date(toDate as string);
    }

    const expenses = await prisma.expense.findMany({
      where,
      skip: parseInt(skip as string),
      take: parseInt(take as string),
      orderBy: { date: 'desc' },
    });

    const total = await prisma.expense.count({ where });

    res.json({ expenses, total });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET /api/expenses/summary - totals + CAC calculation
router.get('/summary', async (req: Request, res: Response) => {
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
    const expenses = await prisma.expense.findMany({
      where: { athleteId },
    });

    const totalSpend = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    expenses.forEach((e: any) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const cacResult = await calculateCAC(athleteId);

    res.json({
      totalSpend,
      byCategory,
      budgetGoal: user.athlete.budgetGoal,
      cacResult,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// POST /api/expenses - create
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

    const { category, label, amount, date, notes, receiptUrl } = req.body;

    const expense = await prisma.expense.create({
      data: {
        athleteId: user.athlete.id,
        category,
        label,
        amount: parseFloat(amount),
        date: new Date(date),
        notes,
        receiptUrl,
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
          action: 'expense_logged',
        },
      });
    }

    // Check for first expense milestone
    const expenseCount = await prisma.expense.count({
      where: { athleteId: user.athlete.id },
    });

    if (expenseCount === 1) {
      await prisma.milestone.create({
        data: {
          athleteId: user.athlete.id,
          type: 'FIRST_EXPENSE_LOGGED',
        },
      });
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PATCH /api/expenses/:id
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

    const expense = await prisma.expense.updateMany({
      where: {
        id: req.params.id,
        athleteId: user.athlete.id,
      },
      data: req.body,
    });

    if (expense.count === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// POST /api/expenses/:id/contacts - link contact
router.post('/:id/contacts', async (req: Request, res: Response) => {
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

    const { contactIds } = req.body; // array of contact IDs

    const links = await prisma.expenseContactLink.createMany({
      data: (contactIds as string[]).map((contactId) => ({
        expenseId: req.params.id,
        contactId,
        athleteId: user.athlete.id,
      })),
    });

    res.json(links);
  } catch (error) {
    console.error('Error linking contact:', error);
    res.status(500).json({ error: 'Failed to link contact' });
  }
});

export default router;
