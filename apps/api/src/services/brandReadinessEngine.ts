import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ChecklistItem {
  done: boolean;
  label: string;
}

export interface BrandReadinessResult {
  score: number;
  tier: 'Nano' | 'Micro' | 'Mid-Tier' | 'Macro';
  followersNeeded: number;
  engagementTarget: number;
  checklist: ChecklistItem[];
}

export async function calculateBrandReadiness(athleteId: string): Promise<BrandReadinessResult> {
  const profiles = await prisma.socialProfile.findMany({
    where: { athleteId },
  });

  let score = 0;
  const checklist: ChecklistItem[] = [];

  // Follower tier: 30 points max
  const totalFollowers = profiles.reduce((sum, p) => sum + p.followerCount, 0);
  if (totalFollowers >= 100000) {
    score += 30;
  } else if (totalFollowers >= 10000) {
    score += 20;
    checklist.push({ done: true, label: 'Reached Micro tier (10k+ followers)' });
  } else if (totalFollowers >= 5000) {
    score += 12;
    checklist.push({
      done: false,
      label: `Grow to 10,000 followers (${10000 - totalFollowers} to go)`,
    });
  } else {
    score += 5;
    checklist.push({
      done: false,
      label: `Grow to 5,000 followers (${5000 - totalFollowers} to go)`,
    });
  }

  // Engagement rate: 30 points max
  const avgEngagement =
    profiles.length > 0
      ? profiles.reduce((sum, p) => sum + p.avgEngagementRate, 0) / profiles.length
      : 0;

  if (avgEngagement >= 5.0) {
    score += 30;
  } else if (avgEngagement >= 3.0) {
    score += 20;
    checklist.push({ done: true, label: 'Engagement rate above 3% benchmark' });
  } else if (avgEngagement >= 1.5) {
    score += 10;
    checklist.push({
      done: false,
      label: `Improve engagement rate to 3%+ (currently ${avgEngagement.toFixed(1)}%)`,
    });
  } else {
    score += 2;
    checklist.push({
      done: false,
      label: 'Engagement rate below 1.5% — focus on content quality over posting frequency',
    });
  }

  // Platform diversity: 20 points
  const connectedPlatforms = profiles.filter(
    (p) => p.lastRefreshed && !p.lastRefreshError
  ).length;
  score += Math.min(connectedPlatforms * 7, 20);
  if (connectedPlatforms < 2) {
    checklist.push({
      done: false,
      label: 'Connect a second social platform to increase brand reach',
    });
  }

  // Consistency: 20 points — based on whether 90-day growth is positive
  const growthPositive = profiles.every((p) => p.monthlyGrowthRate > 0);
  if (growthPositive) {
    score += 20;
    checklist.push({
      done: true,
      label: 'Consistent follower growth across all platforms',
    });
  } else {
    score += 5;
    checklist.push({
      done: false,
      label: 'Some platforms have flat or declining growth — review posting consistency',
    });
  }

  score = Math.min(score, 100);

  const tier =
    totalFollowers >= 500000
      ? ('Macro' as const)
      : totalFollowers >= 100000
        ? ('Mid-Tier' as const)
        : totalFollowers >= 10000
          ? ('Micro' as const)
          : ('Nano' as const);

  const followersNeeded =
    totalFollowers < 10000
      ? 10000 - totalFollowers
      : totalFollowers < 100000
        ? 100000 - totalFollowers
        : totalFollowers < 500000
          ? 500000 - totalFollowers
          : 0;

  return {
    score,
    tier,
    followersNeeded,
    engagementTarget: 3.0,
    checklist,
  };
}
