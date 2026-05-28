import express, { Router } from 'express';

const router = Router();

interface AthleteProfile {
  id: number;
  userId: string;
  role: 'athlete' | 'parent' | 'consultant';
  sport: string;
  gradYear: number;
  state: string;
  budgetGoal?: number;
  gpa?: number;
  sat?: number;
  act?: number;
  testOptional?: boolean;
  athleteName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo purposes (replace with database in production)
const profiles = new Map<string, AthleteProfile>();
let nextId = 1;

// GET /profile - Get current user's profile
router.get('/', (req: any, res) => {
  const userId = req.userId;
  const profile = profiles.get(userId);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  res.json(profile);
});

// POST /profile - Create athlete profile
router.post('/', (req: any, res) => {
  const userId = req.userId;

  // Check if profile already exists
  if (profiles.has(userId)) {
    return res.status(409).json({ error: 'Profile already exists' });
  }

  const {
    role,
    sport,
    gradYear,
    state,
    budgetGoal,
    gpa,
    sat,
    act,
    testOptional,
    athleteName,
  } = req.body;

  // Validate required fields
  if (!role || !sport || !gradYear || !state) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const profile: AthleteProfile = {
    id: nextId++,
    userId,
    role,
    sport,
    gradYear,
    state,
    budgetGoal,
    gpa,
    sat,
    act,
    testOptional,
    athleteName,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  profiles.set(userId, profile);
  res.status(201).json(profile);
});

// PATCH /profile - Update athlete profile
router.patch('/', (req: any, res) => {
  const userId = req.userId;
  const profile = profiles.get(userId);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const {
    role,
    sport,
    gradYear,
    state,
    budgetGoal,
    gpa,
    sat,
    act,
    testOptional,
    athleteName,
  } = req.body;

  // Update fields
  if (role !== undefined) profile.role = role;
  if (sport !== undefined) profile.sport = sport;
  if (gradYear !== undefined) profile.gradYear = gradYear;
  if (state !== undefined) profile.state = state;
  if (budgetGoal !== undefined) profile.budgetGoal = budgetGoal;
  if (gpa !== undefined) profile.gpa = gpa;
  if (sat !== undefined) profile.sat = sat;
  if (act !== undefined) profile.act = act;
  if (testOptional !== undefined) profile.testOptional = testOptional;
  if (athleteName !== undefined) profile.athleteName = athleteName;

  profile.updatedAt = new Date();
  profiles.set(userId, profile);

  res.json(profile);
});

export default router;
