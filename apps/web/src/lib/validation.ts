import { z } from 'zod';

// Expense validation
export const expenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(50000, 'Amount cannot exceed $50,000'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  description: z.string().optional().default(''),
  coachContactId: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// Coach Contact validation
export const coachContactSchema = z.object({
  schoolName: z
    .string()
    .min(2, 'School name must be at least 2 characters')
    .max(255, 'School name too long'),
  divisionTier: z.string().min(1, 'Division tier is required'),
  contactType: z.string().min(1, 'Contact type is required'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  offerStatus: z.string().optional(),
  coachName: z.string().optional(),
  coachEmail: z.string().email('Invalid email').optional(),
});

export type CoachContactFormData = z.infer<typeof coachContactSchema>;

// College Offer validation
export const collegeOfferSchema = z.object({
  schoolName: z.string().min(2, 'School name is required'),
  divisionTier: z.string().min(1, 'Division tier is required'),
  annualCOA: z
    .number()
    .positive('Cost of Attendance must be positive')
    .max(500000, 'COA seems too high'),
  athleticScholarshipPct: z
    .number()
    .min(0, 'Scholarship cannot be negative')
    .max(1, 'Scholarship cannot exceed 100%'),
  meritAidAnnual: z.number().min(0, 'Merit aid cannot be negative').default(0),
  expectedAnnualContrib: z.number().min(0, 'Family contribution cannot be negative').default(0),
  offerStatus: z.string().optional(),
  isVerbal: z.boolean().default(false),
  offerDeadline: z.string().optional(),
  notes: z.string().max(1000).optional(),
  confidence: z.string().optional(),
});

export type CollegeOfferFormData = z.infer<typeof collegeOfferSchema>;

// Social Profile validation
export const socialProfileSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  handle: z.string().min(1, 'Handle is required'),
  url: z.string().url('Invalid URL').optional(),
  followerCount: z.number().min(0, 'Follower count cannot be negative').default(0),
  avgEngagementRate: z.number().min(0).max(100).default(0),
});

export type SocialProfileFormData = z.infer<typeof socialProfileSchema>;

// Settings validation
export const settingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  sport: z.string().min(1, 'Sport is required'),
  graduationYear: z
    .number()
    .min(new Date().getFullYear(), 'Graduation year must be in the future'),
  budgetGoal: z.number().min(0, 'Budget must be non-negative').optional(),
  targetDivisions: z.array(z.string()).optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// Form validation helper
export const validateForm = async <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    return {
      success: true,
      data: await schema.parseAsync(data),
      errors: {},
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        data: null,
        errors,
      };
    }
    throw error;
  }
};
