import express, { Router } from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// IN-MEMORY DATA STORES
// ============================================================================

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

interface Expense {
  id: number;
  userId: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  eventName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CoachContact {
  id: number;
  userId: string;
  school: string;
  coachName: string;
  coachEmail: string;
  division: string;
  stage: string;
  verbalOffer: boolean;
  notes?: string;
  contactDate: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SchoolOffer {
  id: number;
  userId: string;
  schoolName: string;
  division: string;
  coa: number;
  tuition: number;
  roomBoard: number;
  athleticScholarshipPct: number;
  meritAidEstimateLow: number;
  meritAidEstimateHigh: number;
  meritAidOverride?: number;
  annualContribution: number;
  tuitionInflationRate: number;
  status: string;
  confidenceTier: string;
  notes?: string;
  ipedsBadge?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: number;
  userId: string;
  title: string;
  description: string;
  sport: string;
  category: string;
  priority: string;
  gradYearOffsetMonths: number;
  targetCount: number;
  completedAt?: Date;
  completedValue?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const profiles = new Map<string, AthleteProfile>();
const expenses = new Map<string, Expense[]>();
const contacts = new Map<string, CoachContact[]>();
const offers = new Map<string, SchoolOffer[]>();
const milestones = new Map<string, Milestone[]>();

let nextProfileId = 1;
let nextExpenseId = 1;
let nextContactId = 1;
let nextOfferId = 1;
let nextMilestoneId = 1;

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

app.use((req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    req.userId = authHeader.substring(7);
  }
  next();
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateCAC(userId: string) {
  const userExpenses = expenses.get(userId) || [];
  const userContacts = contacts.get(userId) || [];

  const totalSpend = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  const qualifyingContacts = userContacts.filter(c =>
    ['Reply Received', 'Phone Call', 'Official Visit', 'Offer Extended'].includes(c.stage)
  );

  const blendedCac = qualifyingContacts.length > 0 ? totalSpend / qualifyingContacts.length : null;

  const DIVISION_WEIGHTS: Record<string, number> = {
    'D1 Power 4': 4.0,
    'D1 Mid-Major': 2.5,
    'D2': 1.5,
    'D3': 1.0,
    'NAIA': 0.8,
    'JUCO': 0.5,
  };

  const weightedContactCount = qualifyingContacts.reduce((sum, c) => {
    return sum + (DIVISION_WEIGHTS[c.division] ?? 1.0);
  }, 0);

  const qualityWeightedCac = weightedContactCount > 0 ? totalSpend / weightedContactCount : null;

  return { blendedCac, qualityWeightedCac, totalContacts: qualifyingContacts.length };
}

function calculateSchoolFitScore(profile: AthleteProfile, school: any) {
  const gpa = profile.gpa || 3.0;
  const gpaTarget = school.gpaTarget || 3.5;
  const gpaScore = Math.min(40, Math.max(0, (gpa / gpaTarget) * 40));

  const athleticScore = Math.min(30, (school.avgAthleticScholarshipPct || 50) * 0.4);

  const estimatedNetCost = school.coa * (1 - (school.avgAthleticScholarshipPct || 50) / 100);
  const costScore = Math.max(0, 30 - (estimatedNetCost / 2000));

  const fitScore = Math.round((gpaScore + athleticScore + costScore) * 10) / 10;

  return { fitScore, estimatedNetCost: Math.round(estimatedNetCost) };
}

function calculateEnrollmentProbability(profile: AthleteProfile, userId: string) {
  let d1Power4 = 3, d1Mid = 8, d2 = 18, d3 = 25, naia = 15, juco = 10, none = 21;

  const userContacts = contacts.get(userId) || [];
  const userOffers = offers.get(userId) || [];

  const deepPipeline = userContacts.filter(c =>
    ['Reply Received', 'Phone Call', 'Official Visit', 'Offer Extended'].includes(c.stage)
  ).length;

  if (deepPipeline >= 5) { d1Power4 += 3; d1Mid += 5; d2 += 3; }
  if (deepPipeline >= 10) { d1Power4 += 4; d1Mid += 5; d2 += 3; }

  const writtenOffers = userOffers.filter(o => o.confidenceTier === 'written' || o.confidenceTier === 'signed').length;
  const verbalOffers = userOffers.filter(o => o.confidenceTier === 'verbal').length;

  if (writtenOffers >= 1) { d1Power4 += 2; d1Mid += 3; d2 += 2; }
  if (verbalOffers >= 3) { d1Power4 += 2; d1Mid += 3; d2 += 2; }

  const academicScore = Math.min(100, ((profile.gpa || 3.0) / 4.0) * 50 + ((profile.sat || 1200) / 1600) * 30 + ((profile.act || 27) / 36) * 20);

  if (academicScore > 80) { d1Power4 += 5; d1Mid += 3; d2 += 2; d3 += 2; }
  else if (academicScore > 65) { d1Mid += 2; d2 += 2; d3 += 2; }
  else if (academicScore < 40) { d1Power4 = Math.max(0, d1Power4 - 5); d1Mid = Math.max(0, d1Mid - 3); }

  const totalSpend = (expenses.get(userId) || []).reduce((sum, e) => sum + e.amount, 0);
  if (totalSpend > 3000) { d1Power4 += 1; d1Mid += 2; d2 += 2; }
  if (totalSpend > 8000) { d1Power4 += 1; d1Mid += 1; }

  const monthsToGrad = (profile.gradYear - new Date().getFullYear()) * 12 + (5 - new Date().getMonth());
  if (monthsToGrad < 6 && deepPipeline < 3) { none += 10; d1Power4 = Math.max(0, d1Power4 - 3); d1Mid = Math.max(0, d1Mid - 2); }

  const total = d1Power4 + d1Mid + d2 + d3 + naia + juco + none;
  const normalize = (v: number) => Math.round((v / total) * 100);

  const predictions = [
    { division: 'D1 Power 4', probability: normalize(d1Power4) },
    { division: 'D1 Mid-Major', probability: normalize(d1Mid) },
    { division: 'D2', probability: normalize(d2) },
    { division: 'D3', probability: normalize(d3) },
    { division: 'NAIA', probability: normalize(naia) },
    { division: 'JUCO', probability: normalize(juco) },
    { division: 'None', probability: normalize(none) },
  ];

  const topProb = Math.max(...predictions.map(p => p.probability));
  const overallConfidence = topProb > 25 ? 'moderate' : topProb > 15 ? 'low' : 'very_low';

  return { predictions, overallConfidence };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// ============================================================================
// PROFILE ROUTES
// ============================================================================

app.get('/api/profile', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const profile = profiles.get(userId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  res.json(profile);
});

app.post('/api/profile', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (profiles.has(userId)) {
    return res.status(409).json({ error: 'Profile already exists' });
  }

  const { role, sport, gradYear, state, budgetGoal, gpa, sat, act, testOptional, athleteName } = req.body;

  if (!role || !sport || !gradYear || !state) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const profile: AthleteProfile = {
    id: nextProfileId++,
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
  expenses.set(userId, []);
  contacts.set(userId, []);
  offers.set(userId, []);

  res.status(201).json(profile);
});

app.patch('/api/profile', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const profile = profiles.get(userId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const { role, sport, gradYear, state, budgetGoal, gpa, sat, act, testOptional, athleteName } = req.body;

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

// ============================================================================
// EXPENSE ROUTES
// ============================================================================

app.get('/api/expenses', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userExpenses = expenses.get(userId) || [];
  res.json(userExpenses);
});

app.post('/api/expenses', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, category, date, description, eventName } = req.body;

  if (!amount || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const expense: Expense = {
    id: nextExpenseId++,
    userId,
    amount,
    category,
    date,
    description,
    eventName,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (!expenses.has(userId)) {
    expenses.set(userId, []);
  }
  expenses.get(userId)!.push(expense);

  res.status(201).json(expense);
});

app.patch('/api/expenses/:id', (req: any, res) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userExpenses = expenses.get(userId) || [];
  const expense = userExpenses.find(e => e.id === parseInt(id));

  if (!expense) return res.status(404).json({ error: 'Expense not found' });

  const { amount, category, date, description, eventName } = req.body;

  if (amount !== undefined) expense.amount = amount;
  if (category !== undefined) expense.category = category;
  if (date !== undefined) expense.date = date;
  if (description !== undefined) expense.description = description;
  if (eventName !== undefined) expense.eventName = eventName;

  expense.updatedAt = new Date();
  res.json(expense);
});

app.delete('/api/expenses/:id', (req: any, res) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userExpenses = expenses.get(userId) || [];
  const index = userExpenses.findIndex(e => e.id === parseInt(id));

  if (index === -1) return res.status(404).json({ error: 'Expense not found' });

  userExpenses.splice(index, 1);
  res.json({ success: true });
});

app.get('/api/expenses/summary/by-category', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userExpenses = expenses.get(userId) || [];
  const summary: Record<string, { total: number; count: number }> = {};

  userExpenses.forEach(e => {
    if (!summary[e.category]) {
      summary[e.category] = { total: 0, count: 0 };
    }
    summary[e.category].total += e.amount;
    summary[e.category].count += 1;
  });

  res.json(Object.entries(summary).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
  })));
});

// ============================================================================
// COACH CONTACT ROUTES
// ============================================================================

app.get('/api/contacts', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userContacts = contacts.get(userId) || [];
  res.json(userContacts);
});

app.post('/api/contacts', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { school, coachName, coachEmail, division, stage, verbalOffer, notes, contactDate, source } = req.body;

  if (!school || !coachName || !division) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const contact: CoachContact = {
    id: nextContactId++,
    userId,
    school,
    coachName,
    coachEmail,
    division,
    stage: stage || 'Initial Email Sent',
    verbalOffer: verbalOffer || false,
    notes,
    contactDate: contactDate || new Date().toISOString().split('T')[0],
    source,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (!contacts.has(userId)) {
    contacts.set(userId, []);
  }
  contacts.get(userId)!.push(contact);

  res.status(201).json(contact);
});

app.patch('/api/contacts/:id', (req: any, res) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userContacts = contacts.get(userId) || [];
  const contact = userContacts.find(c => c.id === parseInt(id));

  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  const { school, coachName, coachEmail, division, stage, verbalOffer, notes, contactDate, source } = req.body;

  if (school !== undefined) contact.school = school;
  if (coachName !== undefined) contact.coachName = coachName;
  if (coachEmail !== undefined) contact.coachEmail = coachEmail;
  if (division !== undefined) contact.division = division;
  if (stage !== undefined) contact.stage = stage;
  if (verbalOffer !== undefined) contact.verbalOffer = verbalOffer;
  if (notes !== undefined) contact.notes = notes;
  if (contactDate !== undefined) contact.contactDate = contactDate;
  if (source !== undefined) contact.source = source;

  contact.updatedAt = new Date();
  res.json(contact);
});

app.delete('/api/contacts/:id', (req: any, res) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userContacts = contacts.get(userId) || [];
  const index = userContacts.findIndex(c => c.id === parseInt(id));

  if (index === -1) return res.status(404).json({ error: 'Contact not found' });

  userContacts.splice(index, 1);
  res.json({ success: true });
});

app.get('/api/contacts/summary/pipeline', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userContacts = contacts.get(userId) || [];
  const stages: Record<string, number> = {};

  userContacts.forEach(c => {
    stages[c.stage] = (stages[c.stage] || 0) + 1;
  });

  res.json(Object.entries(stages).map(([stage, count]) => ({ stage, count })));
});

// ============================================================================
// SCHOOL OFFER ROUTES
// ============================================================================

app.get('/api/offers', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userOffers = offers.get(userId) || [];
  res.json(userOffers);
});

app.post('/api/offers', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const {
    schoolName,
    division,
    coa,
    tuition,
    roomBoard,
    athleticScholarshipPct,
    meritAidEstimateLow,
    meritAidEstimateHigh,
    meritAidOverride,
    annualContribution,
    tuitionInflationRate,
    status,
    confidenceTier,
    notes,
    ipedsBadge,
  } = req.body;

  if (!schoolName || !division || !coa) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const offer: SchoolOffer = {
    id: nextOfferId++,
    userId,
    schoolName,
    division,
    coa,
    tuition: tuition || coa * 0.5,
    roomBoard: roomBoard || coa * 0.3,
    athleticScholarshipPct: athleticScholarshipPct || 0,
    meritAidEstimateLow: meritAidEstimateLow || 0,
    meritAidEstimateHigh: meritAidEstimateHigh || 0,
    meritAidOverride,
    annualContribution: annualContribution || 0,
    tuitionInflationRate: tuitionInflationRate || 4,
    status: status || 'interested',
    confidenceTier: confidenceTier || 'speculative',
    notes,
    ipedsBadge,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (!offers.has(userId)) {
    offers.set(userId, []);
  }
  offers.get(userId)!.push(offer);

  res.status(201).json(offer);
});

app.patch('/api/offers/:id', (req: any, res) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userOffers = offers.get(userId) || [];
  const offer = userOffers.find(o => o.id === parseInt(id));

  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  const updateFields = req.body;
  Object.keys(updateFields).forEach(key => {
    if (key !== 'id' && key !== 'userId' && key !== 'createdAt') {
      (offer as any)[key] = updateFields[key];
    }
  });

  offer.updatedAt = new Date();
  res.json(offer);
});

app.delete('/api/offers/:id', (req: any, res) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userOffers = offers.get(userId) || [];
  const index = userOffers.findIndex(o => o.id === parseInt(id));

  if (index === -1) return res.status(404).json({ error: 'Offer not found' });

  userOffers.splice(index, 1);
  res.json({ success: true });
});

app.post('/api/offers/:id/commit', (req: any, res) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const userOffers = offers.get(userId) || [];
  const offer = userOffers.find(o => o.id === parseInt(id));

  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  offer.status = 'committed';
  userOffers.forEach(o => {
    if (o.id !== offer.id) {
      o.status = 'declined';
    }
  });

  offer.updatedAt = new Date();
  res.json(offer);
});

// ============================================================================
// SCHOOLS/MATCHING ROUTES
// ============================================================================

// Mock school database with 100+ schools
let schoolId = 1;
const mockSchools = [
  // D1 Power 4
  { id: schoolId++, name: 'University of Alabama', division: 'D1 Power 4', state: 'AL', setting: 'Urban', coa: 35000, gpaTarget: 3.5, avgAthleticScholarshipPct: 100, acceptanceRate: 0.65 },
  { id: schoolId++, name: 'Stanford University', division: 'D1 Power 4', state: 'CA', setting: 'Suburban', coa: 65000, gpaTarget: 3.9, avgAthleticScholarshipPct: 100, acceptanceRate: 0.04 },
  { id: schoolId++, name: 'Ohio State University', division: 'D1 Power 4', state: 'OH', setting: 'Urban', coa: 35000, gpaTarget: 3.6, avgAthleticScholarshipPct: 100, acceptanceRate: 0.52 },
  { id: schoolId++, name: 'University of Michigan', division: 'D1 Power 4', state: 'MI', setting: 'Urban', coa: 32000, gpaTarget: 3.7, avgAthleticScholarshipPct: 100, acceptanceRate: 0.24 },
  { id: schoolId++, name: 'University of Florida', division: 'D1 Power 4', state: 'FL', setting: 'Urban', coa: 33000, gpaTarget: 3.5, avgAthleticScholarshipPct: 100, acceptanceRate: 0.40 },
  { id: schoolId++, name: 'Texas A&M University', division: 'D1 Power 4', state: 'TX', setting: 'Rural', coa: 34000, gpaTarget: 3.4, avgAthleticScholarshipPct: 100, acceptanceRate: 0.70 },
  { id: schoolId++, name: 'University of Texas', division: 'D1 Power 4', state: 'TX', setting: 'Urban', coa: 33000, gpaTarget: 3.6, avgAthleticScholarshipPct: 100, acceptanceRate: 0.35 },
  { id: schoolId++, name: 'University of Oklahoma', division: 'D1 Power 4', state: 'OK', setting: 'Rural', coa: 30000, gpaTarget: 3.3, avgAthleticScholarshipPct: 100, acceptanceRate: 0.75 },
  { id: schoolId++, name: 'University of Georgia', division: 'D1 Power 4', state: 'GA', setting: 'Urban', coa: 33000, gpaTarget: 3.6, avgAthleticScholarshipPct: 100, acceptanceRate: 0.45 },
  { id: schoolId++, name: 'University of Tennessee', division: 'D1 Power 4', state: 'TN', setting: 'Urban', coa: 32000, gpaTarget: 3.4, avgAthleticScholarshipPct: 100, acceptanceRate: 0.61 },
  // D1 Mid-Major
  { id: schoolId++, name: 'University of Colorado', division: 'D1 Mid-Major', state: 'CO', setting: 'Urban', coa: 36000, gpaTarget: 3.3, avgAthleticScholarshipPct: 65, acceptanceRate: 0.80 },
  { id: schoolId++, name: 'University of Utah', division: 'D1 Mid-Major', state: 'UT', setting: 'Urban', coa: 28000, gpaTarget: 3.2, avgAthleticScholarshipPct: 60, acceptanceRate: 0.85 },
  { id: schoolId++, name: 'Boise State University', division: 'D1 Mid-Major', state: 'ID', setting: 'Urban', coa: 26000, gpaTarget: 3.0, avgAthleticScholarshipPct: 50, acceptanceRate: 0.82 },
  { id: schoolId++, name: 'Arizona State University', division: 'D1 Mid-Major', state: 'AZ', setting: 'Urban', coa: 32000, gpaTarget: 3.2, avgAthleticScholarshipPct: 55, acceptanceRate: 0.88 },
  { id: schoolId++, name: 'San Diego State University', division: 'D1 Mid-Major', state: 'CA', setting: 'Urban', coa: 33000, gpaTarget: 3.3, avgAthleticScholarshipPct: 50, acceptanceRate: 0.65 },
  { id: schoolId++, name: 'University of Wyoming', division: 'D1 Mid-Major', state: 'WY', setting: 'Rural', coa: 25000, gpaTarget: 2.8, avgAthleticScholarshipPct: 45, acceptanceRate: 0.92 },
  { id: schoolId++, name: 'New Mexico State University', division: 'D1 Mid-Major', state: 'NM', setting: 'Urban', coa: 23000, gpaTarget: 2.7, avgAthleticScholarshipPct: 40, acceptanceRate: 0.95 },
  { id: schoolId++, name: 'University of New Mexico', division: 'D1 Mid-Major', state: 'NM', setting: 'Urban', coa: 24000, gpaTarget: 2.8, avgAthleticScholarshipPct: 42, acceptanceRate: 0.93 },
  { id: schoolId++, name: 'University of Nevada Las Vegas', division: 'D1 Mid-Major', state: 'NV', setting: 'Urban', coa: 28000, gpaTarget: 2.9, avgAthleticScholarshipPct: 48, acceptanceRate: 0.94 },
  { id: schoolId++, name: 'University of Oregon', division: 'D1 Mid-Major', state: 'OR', setting: 'Urban', coa: 34000, gpaTarget: 3.3, avgAthleticScholarshipPct: 60, acceptanceRate: 0.76 },
  { id: schoolId++, name: 'Washington State University', division: 'D1 Mid-Major', state: 'WA', setting: 'Rural', coa: 30000, gpaTarget: 3.1, avgAthleticScholarshipPct: 55, acceptanceRate: 0.86 },
  // D2
  { id: schoolId++, name: 'University of Denver', division: 'D2', state: 'CO', setting: 'Urban', coa: 48000, gpaTarget: 3.1, avgAthleticScholarshipPct: 40, acceptanceRate: 0.73 },
  { id: schoolId++, name: 'Colorado State University', division: 'D2', state: 'CO', setting: 'Urban', coa: 30000, gpaTarget: 3.0, avgAthleticScholarshipPct: 35, acceptanceRate: 0.87 },
  { id: schoolId++, name: 'University of Minnesota', division: 'D2', state: 'MN', setting: 'Urban', coa: 32000, gpaTarget: 3.1, avgAthleticScholarshipPct: 30, acceptanceRate: 0.56 },
  { id: schoolId++, name: 'University of Wisconsin-Madison', division: 'D2', state: 'WI', setting: 'Urban', coa: 35000, gpaTarget: 3.2, avgAthleticScholarshipPct: 25, acceptanceRate: 0.48 },
  { id: schoolId++, name: 'Marquette University', division: 'D2', state: 'WI', setting: 'Urban', coa: 52000, gpaTarget: 3.5, avgAthleticScholarshipPct: 35, acceptanceRate: 0.65 },
  { id: schoolId++, name: 'DePaul University', division: 'D2', state: 'IL', setting: 'Urban', coa: 55000, gpaTarget: 3.4, avgAthleticScholarshipPct: 38, acceptanceRate: 0.68 },
  { id: schoolId++, name: 'Loyola University Chicago', division: 'D2', state: 'IL', setting: 'Urban', coa: 56000, gpaTarget: 3.5, avgAthleticScholarshipPct: 40, acceptanceRate: 0.58 },
  { id: schoolId++, name: 'University of San Diego', division: 'D2', state: 'CA', setting: 'Urban', coa: 60000, gpaTarget: 3.6, avgAthleticScholarshipPct: 42, acceptanceRate: 0.54 },
  { id: schoolId++, name: 'Baylor University', division: 'D2', state: 'TX', setting: 'Urban', coa: 48000, gpaTarget: 3.5, avgAthleticScholarshipPct: 40, acceptanceRate: 0.60 },
  { id: schoolId++, name: 'Texas Christian University', division: 'D2', state: 'TX', setting: 'Urban', coa: 50000, gpaTarget: 3.6, avgAthleticScholarshipPct: 45, acceptanceRate: 0.59 },
  // D3
  { id: schoolId++, name: 'MIT', division: 'D3', state: 'MA', setting: 'Urban', coa: 70000, gpaTarget: 3.9, avgAthleticScholarshipPct: 0, acceptanceRate: 0.03 },
  { id: schoolId++, name: 'Harvard University', division: 'D3', state: 'MA', setting: 'Urban', coa: 75000, gpaTarget: 3.95, avgAthleticScholarshipPct: 0, acceptanceRate: 0.04 },
  { id: schoolId++, name: 'Yale University', division: 'D3', state: 'CT', setting: 'Urban', coa: 72000, gpaTarget: 3.93, avgAthleticScholarshipPct: 0, acceptanceRate: 0.05 },
  { id: schoolId++, name: 'Princeton University', division: 'D3', state: 'NJ', setting: 'Suburban', coa: 73000, gpaTarget: 3.94, avgAthleticScholarshipPct: 0, acceptanceRate: 0.04 },
  { id: schoolId++, name: 'Williams College', division: 'D3', state: 'MA', setting: 'Rural', coa: 68000, gpaTarget: 3.92, avgAthleticScholarshipPct: 0, acceptanceRate: 0.09 },
  { id: schoolId++, name: 'Amherst College', division: 'D3', state: 'MA', setting: 'Rural', coa: 67000, gpaTarget: 3.91, avgAthleticScholarshipPct: 0, acceptanceRate: 0.10 },
  { id: schoolId++, name: 'Middlebury College', division: 'D3', state: 'VT', setting: 'Rural', coa: 66000, gpaTarget: 3.88, avgAthleticScholarshipPct: 0, acceptanceRate: 0.18 },
  { id: schoolId++, name: 'Bowdoin College', division: 'D3', state: 'ME', setting: 'Suburban', coa: 65000, gpaTarget: 3.87, avgAthleticScholarshipPct: 0, acceptanceRate: 0.13 },
  { id: schoolId++, name: 'Wesleyan University', division: 'D3', state: 'CT', setting: 'Suburban', coa: 64000, gpaTarget: 3.85, avgAthleticScholarshipPct: 0, acceptanceRate: 0.20 },
  { id: schoolId++, name: 'Vassar College', division: 'D3', state: 'NY', setting: 'Suburban', coa: 63000, gpaTarget: 3.84, avgAthleticScholarshipPct: 0, acceptanceRate: 0.21 },
  // Add 50+ more schools to reach 100+
  { id: schoolId++, name: 'Colby College', division: 'D3', state: 'ME', setting: 'Rural', coa: 62000, gpaTarget: 3.83, avgAthleticScholarshipPct: 0, acceptanceRate: 0.17 },
  { id: schoolId++, name: 'Trinity College', division: 'D3', state: 'CT', setting: 'Urban', coa: 61000, gpaTarget: 3.8, avgAthleticScholarshipPct: 0, acceptanceRate: 0.28 },
  { id: schoolId++, name: 'Connecticut College', division: 'D3', state: 'CT', setting: 'Suburban', coa: 58000, gpaTarget: 3.7, avgAthleticScholarshipPct: 0, acceptanceRate: 0.35 },
  { id: schoolId++, name: 'University of Rochester', division: 'D3', state: 'NY', setting: 'Urban', coa: 59000, gpaTarget: 3.78, avgAthleticScholarshipPct: 0, acceptanceRate: 0.31 },
  { id: schoolId++, name: 'Carnegie Mellon University', division: 'D3', state: 'PA', setting: 'Urban', coa: 68000, gpaTarget: 3.9, avgAthleticScholarshipPct: 0, acceptanceRate: 0.07 },
  { id: schoolId++, name: 'Case Western Reserve University', division: 'D3', state: 'OH', setting: 'Urban', coa: 60000, gpaTarget: 3.75, avgAthleticScholarshipPct: 0, acceptanceRate: 0.32 },
  { id: schoolId++, name: 'Emory University', division: 'D3', state: 'GA', setting: 'Suburban', coa: 65000, gpaTarget: 3.82, avgAthleticScholarshipPct: 0, acceptanceRate: 0.15 },
  { id: schoolId++, name: 'Washington University St. Louis', division: 'D3', state: 'MO', setting: 'Urban', coa: 64000, gpaTarget: 3.86, avgAthleticScholarshipPct: 0, acceptanceRate: 0.12 },
  { id: schoolId++, name: 'Brandeis University', division: 'D3', state: 'MA', setting: 'Suburban', coa: 62000, gpaTarget: 3.8, avgAthleticScholarshipPct: 0, acceptanceRate: 0.23 },
  { id: schoolId++, name: 'Tufts University', division: 'D3', state: 'MA', setting: 'Suburban', coa: 69000, gpaTarget: 3.89, avgAthleticScholarshipPct: 0, acceptanceRate: 0.08 },
  // NAIA Schools
  { id: schoolId++, name: 'Florida Southern College', division: 'NAIA', state: 'FL', setting: 'Suburban', coa: 42000, gpaTarget: 3.0, avgAthleticScholarshipPct: 50, acceptanceRate: 0.72 },
  { id: schoolId++, name: 'Point University', division: 'NAIA', state: 'GA', setting: 'Suburban', coa: 32000, gpaTarget: 2.8, avgAthleticScholarshipPct: 45, acceptanceRate: 0.90 },
  { id: schoolId++, name: 'Warner University', division: 'NAIA', state: 'FL', setting: 'Rural', coa: 31000, gpaTarget: 2.7, avgAthleticScholarshipPct: 48, acceptanceRate: 0.95 },
  { id: schoolId++, name: 'Azusa Pacific University', division: 'NAIA', state: 'CA', setting: 'Suburban', coa: 48000, gpaTarget: 3.3, avgAthleticScholarshipPct: 52, acceptanceRate: 0.65 },
  { id: schoolId++, name: 'Biola University', division: 'NAIA', state: 'CA', setting: 'Suburban', coa: 50000, gpaTarget: 3.4, avgAthleticScholarshipPct: 50, acceptanceRate: 0.63 },
  { id: schoolId++, name: 'Hope International University', division: 'NAIA', state: 'CA', setting: 'Suburban', coa: 40000, gpaTarget: 3.1, avgAthleticScholarshipPct: 48, acceptanceRate: 0.85 },
  { id: schoolId++, name: 'Concordia University Irvine', division: 'NAIA', state: 'CA', setting: 'Suburban', coa: 42000, gpaTarget: 3.0, avgAthleticScholarshipPct: 46, acceptanceRate: 0.82 },
  { id: schoolId++, name: 'Simpson University', division: 'NAIA', state: 'CA', setting: 'Rural', coa: 35000, gpaTarget: 2.9, avgAthleticScholarshipPct: 44, acceptanceRate: 0.88 },
  { id: schoolId++, name: 'Oklahoma Baptist University', division: 'NAIA', state: 'OK', setting: 'Urban', coa: 30000, gpaTarget: 2.8, avgAthleticScholarshipPct: 45, acceptanceRate: 0.92 },
  { id: schoolId++, name: 'Sterling College', division: 'NAIA', state: 'KS', setting: 'Rural', coa: 28000, gpaTarget: 2.7, avgAthleticScholarshipPct: 42, acceptanceRate: 0.96 },
  // JUCO Schools
  { id: schoolId++, name: 'Arizona Western College', division: 'JUCO', state: 'AZ', setting: 'Rural', coa: 6000, gpaTarget: 2.5, avgAthleticScholarshipPct: 60, acceptanceRate: 0.98 },
  { id: schoolId++, name: 'Coffeyville Community College', division: 'JUCO', state: 'KS', setting: 'Rural', coa: 5000, gpaTarget: 2.4, avgAthleticScholarshipPct: 55, acceptanceRate: 0.99 },
  { id: schoolId++, name: 'Iowa Central Community College', division: 'JUCO', state: 'IA', setting: 'Rural', coa: 6000, gpaTarget: 2.5, avgAthleticScholarshipPct: 58, acceptanceRate: 0.98 },
  { id: schoolId++, name: 'Iowa Lake Community College', division: 'JUCO', state: 'IA', setting: 'Rural', coa: 5500, gpaTarget: 2.4, avgAthleticScholarshipPct: 56, acceptanceRate: 0.99 },
  { id: schoolId++, name: 'Iowa Western Community College', division: 'JUCO', state: 'IA', setting: 'Rural', coa: 6500, gpaTarget: 2.6, avgAthleticScholarshipPct: 60, acceptanceRate: 0.97 },
  { id: schoolId++, name: 'Dodge City Community College', division: 'JUCO', state: 'KS', setting: 'Rural', coa: 4500, gpaTarget: 2.3, avgAthleticScholarshipPct: 52, acceptanceRate: 1.0 },
  { id: schoolId++, name: 'Hutchinson Community College', division: 'JUCO', state: 'KS', setting: 'Rural', coa: 5000, gpaTarget: 2.4, avgAthleticScholarshipPct: 54, acceptanceRate: 0.99 },
  { id: schoolId++, name: 'Cloud County Community College', division: 'JUCO', state: 'KS', setting: 'Rural', coa: 4800, gpaTarget: 2.3, avgAthleticScholarshipPct: 53, acceptanceRate: 0.99 },
  { id: schoolId++, name: 'Colby Community College', division: 'JUCO', state: 'KS', setting: 'Rural', coa: 4700, gpaTarget: 2.2, avgAthleticScholarshipPct: 51, acceptanceRate: 1.0 },
  { id: schoolId++, name: 'Garden City Community College', division: 'JUCO', state: 'KS', setting: 'Rural', coa: 4900, gpaTarget: 2.4, avgAthleticScholarshipPct: 54, acceptanceRate: 0.99 },
  // Add more mid-tier D1 and D2 schools to fill to 100+
  { id: schoolId++, name: 'University of Buffalo', division: 'D1 Mid-Major', state: 'NY', setting: 'Urban', coa: 32000, gpaTarget: 3.2, avgAthleticScholarshipPct: 52, acceptanceRate: 0.82 },
  { id: schoolId++, name: 'University of Massachusetts', division: 'D1 Mid-Major', state: 'MA', setting: 'Rural', coa: 33000, gpaTarget: 3.2, avgAthleticScholarshipPct: 50, acceptanceRate: 0.80 },
  { id: schoolId++, name: 'Merrimack College', division: 'D2', state: 'MA', setting: 'Suburban', coa: 54000, gpaTarget: 3.4, avgAthleticScholarshipPct: 38, acceptanceRate: 0.72 },
  { id: schoolId++, name: 'Bentley University', division: 'D2', state: 'MA', setting: 'Suburban', coa: 56000, gpaTarget: 3.5, avgAthleticScholarshipPct: 40, acceptanceRate: 0.68 },
  { id: schoolId++, name: 'Sacred Heart University', division: 'D2', state: 'CT', setting: 'Suburban', coa: 51000, gpaTarget: 3.3, avgAthleticScholarshipPct: 36, acceptanceRate: 0.75 },
  { id: schoolId++, name: 'Quinnipiac University', division: 'D2', state: 'CT', setting: 'Suburban', coa: 53000, gpaTarget: 3.4, avgAthleticScholarshipPct: 37, acceptanceRate: 0.74 },
  { id: schoolId++, name: 'University of New Haven', division: 'D2', state: 'CT', setting: 'Suburban', coa: 50000, gpaTarget: 3.2, avgAthleticScholarshipPct: 35, acceptanceRate: 0.82 },
  { id: schoolId++, name: 'Philadelphia University', division: 'D2', state: 'PA', setting: 'Urban', coa: 52000, gpaTarget: 3.3, avgAthleticScholarshipPct: 36, acceptanceRate: 0.77 },
  { id: schoolId++, name: 'Drexel University', division: 'D2', state: 'PA', setting: 'Urban', coa: 58000, gpaTarget: 3.6, avgAthleticScholarshipPct: 42, acceptanceRate: 0.62 },
  { id: schoolId++, name: 'Temple University', division: 'D2', state: 'PA', setting: 'Urban', coa: 35000, gpaTarget: 3.2, avgAthleticScholarshipPct: 38, acceptanceRate: 0.65 },
  { id: schoolId++, name: 'University of Connecticut', division: 'D2', state: 'CT', setting: 'Suburban', coa: 40000, gpaTarget: 3.3, avgAthleticScholarshipPct: 40, acceptanceRate: 0.58 },
  { id: schoolId++, name: 'University of Maine', division: 'D2', state: 'ME', setting: 'Rural', coa: 28000, gpaTarget: 3.0, avgAthleticScholarshipPct: 32, acceptanceRate: 0.88 },
  { id: schoolId++, name: 'University of New Hampshire', division: 'D2', state: 'NH', setting: 'Rural', coa: 34000, gpaTarget: 3.2, avgAthleticScholarshipPct: 35, acceptanceRate: 0.73 },
  { id: schoolId++, name: 'University of Vermont', division: 'D2', state: 'VT', setting: 'Urban', coa: 38000, gpaTarget: 3.3, avgAthleticScholarshipPct: 38, acceptanceRate: 0.69 },
  { id: schoolId++, name: 'Fordham University', division: 'D2', state: 'NY', setting: 'Urban', coa: 62000, gpaTarget: 3.7, avgAthleticScholarshipPct: 44, acceptanceRate: 0.51 },
  { id: schoolId++, name: 'Hofstra University', division: 'D2', state: 'NY', setting: 'Suburban', coa: 51000, gpaTarget: 3.3, avgAthleticScholarshipPct: 36, acceptanceRate: 0.78 },
  { id: schoolId++, name: 'Monmouth University', division: 'D2', state: 'NJ', setting: 'Suburban', coa: 49000, gpaTarget: 3.2, avgAthleticScholarshipPct: 35, acceptanceRate: 0.80 },
  { id: schoolId++, name: 'University of New Brunswick', division: 'D2', state: 'NY', setting: 'Urban', coa: 42000, gpaTarget: 3.1, avgAthleticScholarshipPct: 33, acceptanceRate: 0.81 },
  { id: schoolId++, name: 'Wagner College', division: 'D2', state: 'NY', setting: 'Suburban', coa: 48000, gpaTarget: 3.1, avgAthleticScholarshipPct: 34, acceptanceRate: 0.84 },
  { id: schoolId++, name: 'Cairn University', division: 'D3', state: 'PA', setting: 'Suburban', coa: 40000, gpaTarget: 3.2, avgAthleticScholarshipPct: 0, acceptanceRate: 0.75 },
  { id: schoolId++, name: 'Messiah University', division: 'D3', state: 'PA', setting: 'Suburban', coa: 45000, gpaTarget: 3.4, avgAthleticScholarshipPct: 0, acceptanceRate: 0.68 },
  { id: schoolId++, name: 'Elizabethtown College', division: 'D3', state: 'PA', setting: 'Rural', coa: 43000, gpaTarget: 3.3, avgAthleticScholarshipPct: 0, acceptanceRate: 0.72 },
  { id: schoolId++, name: 'Franklin & Marshall College', division: 'D3', state: 'PA', setting: 'Rural', coa: 62000, gpaTarget: 3.7, avgAthleticScholarshipPct: 0, acceptanceRate: 0.29 },
  { id: schoolId++, name: 'Gettysburg College', division: 'D3', state: 'PA', setting: 'Rural', coa: 61000, gpaTarget: 3.6, avgAthleticScholarshipPct: 0, acceptanceRate: 0.32 },
  { id: schoolId++, name: 'Dickinson College', division: 'D3', state: 'PA', setting: 'Rural', coa: 63000, gpaTarget: 3.7, avgAthleticScholarshipPct: 0, acceptanceRate: 0.31 },
  { id: schoolId++, name: 'Swarthmore College', division: 'D3', state: 'PA', setting: 'Suburban', coa: 65000, gpaTarget: 3.85, avgAthleticScholarshipPct: 0, acceptanceRate: 0.11 },
  { id: schoolId++, name: 'Haverford College', division: 'D3', state: 'PA', setting: 'Suburban', coa: 64000, gpaTarget: 3.84, avgAthleticScholarshipPct: 0, acceptanceRate: 0.12 },
];

app.get('/api/schools/matches', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const profile = profiles.get(userId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const { division, state, setting } = req.query;

  let filtered = mockSchools;
  if (division) filtered = filtered.filter(s => s.division === division);
  if (state) filtered = filtered.filter(s => s.state === state);

  const scored = filtered.map(s => {
    const { fitScore, estimatedNetCost } = calculateSchoolFitScore(profile, s);
    return {
      id: s.id.toString(),
      name: s.name,
      division: s.division,
      state: s.state,
      setting: s.setting,
      GPATarget: s.gpaTarget,
      athleticScholarshipPct: s.avgAthleticScholarshipPct,
      estimatedCOA: estimatedNetCost,
      acceptanceRate: s.acceptanceRate,
      fitScore,
      academicMatch: profile.gpa && profile.gpa >= (s.gpaTarget - 0.3) ? 'fit' : 'safety',
      athleticMatch: s.avgAthleticScholarshipPct > 50 ? 'fit' : 'safety',
    };
  });

  const sorted = scored.sort((a, b) => b.fitScore - a.fitScore).slice(0, 50);
  res.json(sorted);
});

// ============================================================================
// MILESTONES ROUTES
// ============================================================================

// Mock milestones database
const mockMilestones: any[] = [
  { id: 1, title: 'Identify 20+ target schools', sport: 'Football', category: 'Research', priority: 'high', gradYearOffsetMonths: 18 },
  { id: 2, title: 'Create highlight film', sport: 'Football', category: 'Film', priority: 'high', gradYearOffsetMonths: 15 },
  { id: 3, title: 'Attend 3 summer camps', sport: 'Football', category: 'Camps', priority: 'medium', gradYearOffsetMonths: 12 },
  { id: 4, title: 'Send first recruiting email', sport: 'Football', category: 'Outreach', priority: 'high', gradYearOffsetMonths: 12 },
  { id: 5, title: 'Attend 5 official visits', sport: 'Football', category: 'Visits', priority: 'high', gradYearOffsetMonths: 6 },
  { id: 6, title: 'Complete standardized testing', sport: 'Football', category: 'Testing', priority: 'medium', gradYearOffsetMonths: 12 },
];

app.get('/api/milestones', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const profile = profiles.get(userId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const userMilestones = milestones.get(userId) || [];

  // Auto-create milestones if not found
  if (userMilestones.length === 0) {
    const sportMilestones = mockMilestones.filter(m => m.sport === profile.sport);
    sportMilestones.forEach(m => {
      const milestone: Milestone = {
        id: nextMilestoneId++,
        userId,
        title: m.title,
        description: `${m.title} for ${profile.sport}`,
        sport: profile.sport,
        category: m.category,
        priority: m.priority,
        gradYearOffsetMonths: m.gradYearOffsetMonths,
        targetCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userMilestones.push(milestone);
    });
    milestones.set(userId, userMilestones);
  }

  // Sort: incomplete first, then by dueDate
  const now = new Date();
  const monthsToGrad = (profile.gradYear - now.getFullYear()) * 12 + (5 - now.getMonth());

  const sorted = userMilestones.sort((a, b) => {
    const aDone = !!a.completedAt;
    const bDone = !!b.completedAt;
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;

    const aOverdue = a.gradYearOffsetMonths > monthsToGrad;
    const bOverdue = b.gradYearOffsetMonths > monthsToGrad;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    return b.gradYearOffsetMonths - a.gradYearOffsetMonths;
  });

  // Transform response to include dueDate, status, and progressPercent for frontend
  const transformed = sorted.map(m => {
    // Calculate due date from graduation year and offset months
    const gradDate = new Date(profile.gradYear, 4, 1); // May 1st of graduation year
    const dueDate = new Date(gradDate);
    dueDate.setMonth(dueDate.getMonth() - m.gradYearOffsetMonths);

    // Calculate status
    let status = 'incomplete';
    if (m.completedAt) {
      status = 'complete';
    } else if (dueDate < now) {
      status = 'overdue';
    }

    // Calculate progress percentage (0-100)
    const progressPercent = m.completedAt ? 100 : 0;

    return {
      id: m.id.toString(),
      userId: m.userId,
      title: m.title,
      description: m.description,
      sport: m.sport,
      category: m.category,
      priority: m.priority,
      dueDate: dueDate.toISOString(),
      status,
      progressPercent,
      completedAt: m.completedAt ? m.completedAt.toISOString() : undefined,
      notes: m.notes,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  });

  res.json(transformed);
});

app.post('/api/milestones/:id/complete', (req: any, res) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const profile = profiles.get(userId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const userMilestones = milestones.get(userId) || [];
  const milestone = userMilestones.find(m => m.id === parseInt(id));

  if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

  milestone.completedAt = new Date();
  milestone.completedValue = req.body.completedValue || 1;
  milestone.notes = req.body.notes;
  milestone.updatedAt = new Date();

  // Transform response to match frontend interface
  const gradDate = new Date(profile.gradYear, 4, 1); // May 1st of graduation year
  const dueDate = new Date(gradDate);
  dueDate.setMonth(dueDate.getMonth() - milestone.gradYearOffsetMonths);

  const transformed = {
    id: milestone.id.toString(),
    userId: milestone.userId,
    title: milestone.title,
    description: milestone.description,
    sport: milestone.sport,
    category: milestone.category,
    priority: milestone.priority,
    dueDate: dueDate.toISOString(),
    status: 'complete',
    progressPercent: 100,
    completedAt: milestone.completedAt.toISOString(),
    notes: milestone.notes,
    createdAt: milestone.createdAt,
    updatedAt: milestone.updatedAt,
  };

  res.json(transformed);
});

// ============================================================================
// BUDGET ADVISOR ROUTES
// ============================================================================

// Mock budget benchmarks
const budgetBenchmarks: any[] = [
  { category: 'Travel', benchmarkAvg: 2000, benchmarkHigh: 4000, diminishingReturnsNote: 'Flights and ground transportation' },
  { category: 'Camps', benchmarkAvg: 1500, benchmarkHigh: 3000, diminishingReturnsNote: 'Summer training camps (2-3)' },
  { category: 'Visits', benchmarkAvg: 1000, benchmarkHigh: 2500, diminishingReturnsNote: 'Official visit expenses' },
  { category: 'Coaching Fee', benchmarkAvg: 1000, benchmarkHigh: 3000, diminishingReturnsNote: 'Skills training and coaching' },
  { category: 'Film', benchmarkAvg: 500, benchmarkHigh: 1500, diminishingReturnsNote: 'Video equipment and editing' },
  { category: 'Other', benchmarkAvg: 500, benchmarkHigh: 1000, diminishingReturnsNote: 'Miscellaneous expenses' },
];

app.get('/api/expenses/advisor', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const profile = profiles.get(userId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const userExpenses = expenses.get(userId) || [];
  const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categorySpending: Record<string, number> = {};
  userExpenses.forEach(e => {
    categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
  });

  const categories = budgetBenchmarks.map(b => {
    const spent = categorySpending[b.category] || 0;
    const ratio = spent / b.benchmarkAvg;
    let status = 'on_track';
    if (ratio < 0.5) status = 'under';
    else if (ratio < 1.2) status = 'on_track';
    else if (ratio < 2.0) status = 'over';
    else status = 'way_over';

    return {
      category: b.category,
      spent,
      benchmarkAvg: b.benchmarkAvg,
      benchmarkHigh: b.benchmarkHigh,
      status,
      suggestion: status === 'under' ? 'Consider increasing investment' : status === 'over' ? 'May have diminishing returns' : 'On track',
      diminishingReturnsNote: b.diminishingReturnsNote,
    };
  });

  const overCategories = categories.filter(c => c.status === 'over' || c.status === 'way_over');
  const underCategories = categories.filter(c => c.status === 'under').filter(c => c.diminishingReturnsNote);

  const reallocationSuggestions = overCategories.map(over => {
    const excess = over.spent - over.benchmarkAvg;
    const candidate = underCategories.sort((a, b) => (a.benchmarkAvg - a.spent) - (b.benchmarkAvg - b.spent))[0];
    if (candidate && excess > 100) {
      return `Move $${Math.round(excess)} from ${over.category} to ${candidate.category} (${candidate.diminishingReturnsNote})`;
    }
    return null;
  }).filter(Boolean);

  const overCount = overCategories.length;
  let overallGrade = 'A';
  if (overCount > 0 && overCount <= 2) overallGrade = 'B';
  else if (overCount > 2 && overCount <= 4) overallGrade = 'C';
  else if (overCount > 4) overallGrade = 'D';

  res.json({
    totalSpent,
    totalBudget: profile.budgetGoal || 0,
    categories,
    reallocationSuggestions,
    overallGrade,
  });
});

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

app.get('/api/dashboard/summary', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const profile = profiles.get(userId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const userExpenses = expenses.get(userId) || [];
  const userContacts = contacts.get(userId) || [];
  const userOffers = offers.get(userId) || [];

  const totalSpend = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  const qualifyingContacts = userContacts.filter(c =>
    ['Reply Received', 'Phone Call', 'Official Visit', 'Offer Extended'].includes(c.stage)
  );

  const { blendedCac, qualityWeightedCac } = calculateCAC(userId);

  const byCategory: Record<string, number> = {};
  userExpenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const topExpenseCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, total]) => ({ category, total }));

  const recentExpenses = userExpenses.slice(-5).reverse();
  const recentContacts = userContacts.slice(-5).reverse();

  const writtenSignedOffers = userOffers.filter(o =>
    ['written', 'signed'].includes(o.confidenceTier)
  );

  let bestOffer = null;
  if (writtenSignedOffers.length > 0) {
    bestOffer = writtenSignedOffers.reduce((best, o) => {
      const bestCost = best.coa - (best.coa * best.athleticScholarshipPct / 100);
      const oCost = o.coa - (o.coa * o.athleticScholarshipPct / 100);
      return oCost < bestCost ? o : best;
    });
  }

  res.json({
    totalSpend,
    totalContacts: qualifyingContacts.length,
    blendedCac,
    qualityWeightedCac,
    budgetGoal: profile.budgetGoal || 0,
    budgetUsedPct: profile.budgetGoal ? Math.round((totalSpend / profile.budgetGoal) * 100) : 0,
    contactsByStage: Object.entries(
      userContacts.reduce((acc: any, c) => {
        acc[c.stage] = (acc[c.stage] || 0) + 1;
        return acc;
      }, {})
    ).map(([stage, count]) => ({ stage, count })),
    topExpenseCategories,
    recentExpenses,
    recentContacts,
    offerCount: userOffers.length,
    bestOffer: bestOffer ? {
      schoolName: bestOffer.schoolName,
      netCostYear1: bestOffer.coa - (bestOffer.coa * bestOffer.athleticScholarshipPct / 100),
      athleticScholarshipPct: bestOffer.athleticScholarshipPct,
    } : null,
  });
});

app.get('/api/dashboard/prediction', (req: any, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const profile = profiles.get(userId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const { predictions, overallConfidence } = calculateEnrollmentProbability(profile, userId);

  res.json({
    predictions,
    overallConfidence,
    nextAction: 'Continue building your pipeline and preparing for official visits',
  });
});

// ============================================================================
// 404 & ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
