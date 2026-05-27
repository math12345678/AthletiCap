import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Rodriguez family parent user
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@rodriguez.family' },
    update: {},
    create: {
      email: 'parent@rodriguez.family',
      clerkId: 'user_rodriguez_parent_demo',
      role: 'PARENT',
      stateCode: 'GA',
      parent: {
        create: {
          firstName: 'Maria',
          lastName: 'Rodriguez',
        },
      },
    },
  });

  // Create Rodriguez athlete user
  const athleteUser = await prisma.user.upsert({
    where: { email: 'athlete@rodriguez.family' },
    update: {},
    create: {
      email: 'athlete@rodriguez.family',
      clerkId: 'user_rodriguez_athlete_demo',
      role: 'ATHLETE',
      birthDate: new Date('2007-03-15'),
      stateCode: 'GA',
      parentConsent: true,
      consentDate: new Date('2025-01-15'),
    },
  });

  // Create athlete profile
  const athlete = await prisma.athlete.upsert({
    where: { userId: athleteUser.id },
    update: {},
    create: {
      userId: athleteUser.id,
      firstName: 'Sofia',
      lastName: 'Rodriguez',
      sport: 'Soccer',
      gradYear: 2026,
      gpa: 3.7,
      actScore: 30,
      satScore: 1380,
      stateResident: 'GA',
      budgetGoal: 5000,
    },
  });

  // Create expenses
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        athleteId: athlete.id,
        category: 'SHOWCASE_CAMP',
        label: 'Elite Showcase - Atlanta',
        amount: 350,
        date: new Date('2025-01-20'),
        notes: 'Showcased for 6 D1/D2 coaches',
      },
    }),
    prisma.expense.create({
      data: {
        athleteId: athlete.id,
        category: 'TRAVEL_AIRFARE',
        label: 'Flight to Phoenix - Desert Elite Tournament',
        amount: 280,
        date: new Date('2025-02-08'),
      },
    }),
    prisma.expense.create({
      data: {
        athleteId: athlete.id,
        category: 'TRAVEL_HOTEL',
        label: 'Hotel 3 nights - Phoenix',
        amount: 450,
        date: new Date('2025-02-08'),
      },
    }),
    prisma.expense.create({
      data: {
        athleteId: athlete.id,
        category: 'TOURNAMENT_ENTRY',
        label: 'Desert Elite Tournament registration',
        amount: 275,
        date: new Date('2025-02-08'),
      },
    }),
    prisma.expense.create({
      data: {
        athleteId: athlete.id,
        category: 'TRAINING',
        label: 'Monthly training with club coach',
        amount: 300,
        date: new Date('2025-03-01'),
      },
    }),
    prisma.expense.create({
      data: {
        athleteId: athlete.id,
        category: 'HIGHLIGHT_REEL',
        label: 'Highlight video editing service',
        amount: 400,
        date: new Date('2025-01-30'),
      },
    }),
  ]);

  // Create coach contacts
  const contacts = await Promise.all([
    prisma.coachContact.create({
      data: {
        athleteId: athlete.id,
        schoolName: 'University of California, Los Angeles',
        coachName: 'Coach Mike Johnson',
        coachEmail: 'mjohnson@ucla.edu',
        contactType: 'REPLY_RECEIVED',
        divisionTier: 'D1_POWER4',
        contactDate: new Date('2025-01-25'),
        notes: 'Initial contact from showcase, positive response',
      },
    }),
    prisma.coachContact.create({
      data: {
        athleteId: athlete.id,
        schoolName: 'Georgia State University',
        coachName: 'Coach Sarah Chen',
        coachEmail: 'schen@gsu.edu',
        contactType: 'REPLY_RECEIVED',
        divisionTier: 'D1_MID_MAJOR',
        contactDate: new Date('2025-02-12'),
        notes: 'Contact from tournament, requested more film',
      },
    }),
    prisma.coachContact.create({
      data: {
        athleteId: athlete.id,
        schoolName: 'University of Georgia',
        coachName: 'Coach David Williams',
        coachEmail: 'dwilliams@uga.edu',
        contactType: 'PHONE_CALL',
        divisionTier: 'D1_POWER4',
        contactDate: new Date('2025-03-05'),
        notes: 'Phone call regarding walk-on opportunity',
      },
    }),
    prisma.coachContact.create({
      data: {
        athleteId: athlete.id,
        schoolName: 'Mercer University',
        coachName: 'Coach Jennifer Lee',
        coachEmail: 'jlee@mercer.edu',
        contactType: 'REPLY_RECEIVED',
        divisionTier: 'D2',
        contactDate: new Date('2025-02-20'),
      },
    }),
    prisma.coachContact.create({
      data: {
        athleteId: athlete.id,
        schoolName: 'Berry College',
        coachName: 'Coach Tom Bradley',
        coachEmail: 'tbradley@berry.edu',
        contactType: 'REPLY_RECEIVED',
        divisionTier: 'D3',
        contactDate: new Date('2025-03-10'),
      },
    }),
    prisma.coachContact.create({
      data: {
        athleteId: athlete.id,
        schoolName: 'Shorter University',
        coachName: 'Coach Lisa Martinez',
        coachEmail: 'lmartinez@shorter.edu',
        contactType: 'REPLY_RECEIVED',
        divisionTier: 'D3',
        contactDate: new Date('2025-03-08'),
      },
    }),
  ]);

  // Link expenses to contacts
  await prisma.expenseContactLink.createMany({
    data: [
      { expenseId: expenses[0].id, contactId: contacts[0].id, athleteId: athlete.id },
      { expenseId: expenses[0].id, contactId: contacts[2].id, athleteId: athlete.id },
      { expenseId: expenses[1].id, contactId: contacts[1].id, athleteId: athlete.id },
      { expenseId: expenses[2].id, contactId: contacts[1].id, athleteId: athlete.id },
      { expenseId: expenses[3].id, contactId: contacts[1].id, athleteId: athlete.id },
    ],
  });

  // Create college offers
  await Promise.all([
    prisma.collegeOffer.create({
      data: {
        athleteId: athlete.id,
        schoolName: 'University of California, Los Angeles',
        division: 'D1',
        athleticScholarshipPct: 0.25,
        meritAidRangeLow: 8000,
        meritAidRangeHigh: 15000,
        annualCOA: 68000,
        coaDataYear: 2025,
        tuition: 47000,
        roomAndBoard: 18000,
        otherFees: 3000,
        expectedAnnualContrib: 5000,
        isVerbal: false,
        confidenceLevel: 'WRITTEN',
        status: 'OFFER_RECEIVED',
      },
    }),
    prisma.collegeOffer.create({
      data: {
        athleteId: athlete.id,
        schoolName: 'University of Georgia',
        division: 'D1',
        athleticScholarshipPct: 0.0,
        meritAidRangeLow: 12000,
        meritAidRangeHigh: 18000,
        annualCOA: 31500,
        coaDataYear: 2025,
        tuition: 14500,
        roomAndBoard: 13000,
        otherFees: 4000,
        expectedAnnualContrib: 5000,
        isVerbal: true,
        confidenceLevel: 'VERBAL',
        status: 'OFFER_RECEIVED',
        notes: 'Walk-on with academic merit aid potential',
      },
    }),
    prisma.collegeOffer.create({
      data: {
        athleteId: athlete.id,
        schoolName: 'Georgia State University',
        division: 'D1',
        athleticScholarshipPct: 0.6,
        meritAidRangeLow: 5000,
        meritAidRangeHigh: 10000,
        annualCOA: 39000,
        coaDataYear: 2025,
        tuition: 18000,
        roomAndBoard: 15000,
        otherFees: 6000,
        expectedAnnualContrib: 5000,
        isVerbal: false,
        confidenceLevel: 'WRITTEN',
        status: 'OFFER_RECEIVED',
      },
    }),
  ]);

  // Create social profile
  await prisma.socialProfile.create({
    data: {
      athleteId: athlete.id,
      platform: 'INSTAGRAM',
      handle: '@sofiarodzguez_soccer',
      followerCount: 8200,
      followingCount: 1240,
      avgEngagementRate: 3.8,
      monthlyGrowthRate: 2.1,
      lastRefreshed: new Date(),
    },
  });

  // Create milestones
  await Promise.all([
    prisma.milestone.create({
      data: {
        athleteId: athlete.id,
        type: 'FIRST_EXPENSE_LOGGED',
        unlockedAt: new Date('2025-01-20'),
      },
    }),
    prisma.milestone.create({
      data: {
        athleteId: athlete.id,
        type: 'FIRST_COACH_REPLY',
        unlockedAt: new Date('2025-01-25'),
        metadata: JSON.stringify({ coachName: 'Coach Mike Johnson', school: 'UCLA' }),
      },
    }),
    prisma.milestone.create({
      data: {
        athleteId: athlete.id,
        type: 'FIRST_OFFER_ADDED',
        unlockedAt: new Date('2025-02-15'),
      },
    }),
  ]);

  // Create brand readiness score
  await prisma.brandReadinessScore.create({
    data: {
      athleteId: athlete.id,
      score: 68,
      tier: 'Micro',
      followersNeeded: 1800,
      engagementTarget: 3.0,
      checklistJson: JSON.stringify([
        { done: true, label: 'Reached Micro tier (10k+ followers)' },
        { done: true, label: 'Engagement rate above 3% benchmark' },
        { done: true, label: 'Consistent follower growth across all platforms' },
        { done: false, label: 'Connect a second social platform to increase brand reach' },
        { done: false, label: 'Explore content strategy to reach Macro tier' },
      ]),
    },
  });

  console.log('✅ Demo account created successfully!');
  console.log('📧 Email: athlete@rodriguez.family');
  console.log('📊 Athlete: Sofia Rodriguez (17), Soccer, Class of 2026');
  console.log('💰 Budget Goal: $5,000');
  console.log('📍 State: Georgia (NIL permitted)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
