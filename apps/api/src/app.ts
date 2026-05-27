import express from 'express';
import cors from 'cors';
import { requireAuth } from '@clerk/express';

import expensesRouter from './routes/expenses.js';
import contactsRouter from './routes/contacts.js';
import offersRouter from './routes/offers.js';
import influenceRouter from './routes/influence.js';
import dashboardRouter from './routes/dashboard.js';
import authRouter from './routes/auth.js';
import { nilEligibilityMiddleware } from './middleware/nilEligibility.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Clerk auth middleware - extract userId
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    // In a real app, you'd verify the JWT token here
    // For now, extract from Authorization header
    // Clerk middleware would normally do this
    req.userId = authHeader.substring(7); // For demo purposes
  }
  next();
});

// NIL eligibility check (runs on all protected routes)
app.use(nilEligibilityMiddleware);

// Auth routes (no protection needed)
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/expenses', (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}, expensesRouter);

app.use('/api/contacts', (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}, contactsRouter);

app.use('/api/offers', (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}, offersRouter);

app.use('/api/influence', (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}, influenceRouter);

app.use('/api/dashboard', (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}, dashboardRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
