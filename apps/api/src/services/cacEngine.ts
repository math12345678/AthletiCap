import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DIVISION_WEIGHTS: Record<string, number> = {
  D1_POWER4: 4.0,
  D1_MID_MAJOR: 2.5,
  D2: 1.5,
  D3: 1.0,
  NAIA: 0.8,
  JUCO: 0.5,
};

const QUALIFYING_TYPES = [
  'REPLY_RECEIVED',
  'PHONE_CALL',
  'OFFICIAL_VISIT',
  'OFFER_EXTENDED',
];

export interface CACResult {
  blendedCAC: number | null;
  weightedCAC: number | null;
  contactValues: Array<{
    schoolName: string;
    divisionTier: string;
    weight: number;
    linkedSpend: number;
  }>;
  totalSpend: number;
  totalContacts: number;
  weightedContactCount: number;
}

export async function calculateCAC(athleteId: string): Promise<CACResult> {
  const expenses = await prisma.expense.findMany({
    where: { athleteId },
  });

  const contacts = await prisma.coachContact.findMany({
    where: { athleteId },
  });

  const links = await prisma.expenseContactLink.findMany({
    where: { athleteId },
    include: { expense: true },
  });

  const totalSpend = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  const contactValues = contacts
    .filter((c: any) => QUALIFYING_TYPES.includes(c.contactType))
    .map((c: any) => {
      const linkedSpend = links
        .filter((l: any) => l.contactId === c.id)
        .reduce((sum: number, l: any) => sum + l.expense.amount, 0);

      return {
        schoolName: c.schoolName,
        divisionTier: c.divisionTier,
        weight: DIVISION_WEIGHTS[c.divisionTier],
        linkedSpend,
      };
    });

  const blendedCAC =
    contacts.length > 0 ? totalSpend / contacts.length : null;

  const weightedContactCount = contactValues.reduce(
    (sum: number, cv: any) => sum + cv.weight,
    0
  );
  const weightedCAC = weightedContactCount > 0 ? totalSpend / weightedContactCount : null;

  return {
    blendedCAC,
    weightedCAC,
    contactValues,
    totalSpend,
    totalContacts: contacts.length,
    weightedContactCount,
  };
}
