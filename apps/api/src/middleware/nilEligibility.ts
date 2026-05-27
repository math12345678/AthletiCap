import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import nilStateRules from '../data/nil_state_rules.json' assert { type: 'json' };

const prisma = new PrismaClient();

export interface NilEligibilityInfo {
  eligible: boolean;
  reason?: string;
  restrictions: string[];
}

declare global {
  namespace Express {
    interface Request {
      nilEligibility?: NilEligibilityInfo;
      userId?: string;
    }
  }
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export async function nilEligibilityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.userId) {
    req.nilEligibility = { eligible: false, restrictions: [] };
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId },
      include: { athlete: true },
    });

    if (!user || !user.athlete) {
      req.nilEligibility = { eligible: false, restrictions: [] };
      return next();
    }

    // Server re-reads stateCode from DB, never from request body
    const stateCode = user.stateCode;
    const stateRule = (nilStateRules as any)[stateCode];

    const birthDate = user.birthDate;
    const age = birthDate ? calculateAge(birthDate) : 18;
    const hasConsent = age >= 18 || user.parentConsent;

    const permitted = stateRule?.permitted === true;

    req.nilEligibility = {
      eligible: hasConsent && permitted,
      reason: !hasConsent
        ? 'minor_no_consent'
        : !permitted
          ? 'state_prohibited'
          : undefined,
      restrictions: stateRule?.restrictions ?? [],
    };
  } catch (error) {
    console.error('NIL eligibility check error:', error);
    req.nilEligibility = { eligible: false, restrictions: [] };
  }

  next();
}

export function requireNILEligibility(req: Request, res: Response, next: NextFunction) {
  if (!req.nilEligibility?.eligible) {
    return res.status(403).json({
      error: {
        code: 'NIL_NOT_ELIGIBLE',
        reason: req.nilEligibility?.reason || 'unknown',
      },
    });
  }
  next();
}
