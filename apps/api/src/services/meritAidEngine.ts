export interface MeritAidRange {
  low: number;
  high: number;
  confidence: 'low' | 'moderate' | 'high';
  note: string;
}

export interface SchoolData {
  annualCOA: number;
  endowmentPerFTE?: number;
  pellGrantRate?: number;
  act75thPctile?: number;
}

export interface AthleteProfile {
  gpa?: number;
  actScore?: number;
  satScore?: number;
}

export function estimateMeritAid(
  athlete: AthleteProfile,
  school: SchoolData
): MeritAidRange {
  const gpa = athlete.gpa ?? 3.0;
  const act = athlete.actScore ?? 24;

  // Base bracket (GPA + ACT)
  let baseLow = 0,
    baseHigh = 5000;
  if (gpa >= 3.9 && act >= 34) {
    baseLow = 20000;
    baseHigh = 45000;
  } else if (gpa >= 3.7 && act >= 31) {
    baseLow = 12000;
    baseHigh = 28000;
  } else if (gpa >= 3.5 && act >= 28) {
    baseLow = 5000;
    baseHigh = 14000;
  } else if (gpa >= 3.2 && act >= 25) {
    baseLow = 2000;
    baseHigh = 8000;
  }

  // School generosity multiplier (0.5 to 1.5)
  let multiplier = 1.0;
  if (school.endowmentPerFTE && school.endowmentPerFTE > 100000) {
    multiplier += 0.3;
  }
  if (school.pellGrantRate && school.pellGrantRate < 0.25) {
    multiplier += 0.2; // less need-based = more merit
  }
  if (
    school.act75thPctile &&
    act > school.act75thPctile
  ) {
    multiplier += 0.2; // athlete is in top quartile
  }

  // Cap at published COA
  const low = Math.min(
    Math.round(baseLow * multiplier),
    school.annualCOA * 0.9
  );
  const high = Math.min(
    Math.round(baseHigh * multiplier),
    school.annualCOA * 0.9
  );

  const hasSchoolData = school.endowmentPerFTE ? true : false;
  const isTopQuartile = school.act75thPctile && act > school.act75thPctile;

  return {
    low,
    high,
    confidence: hasSchoolData ? 'moderate' : 'low',
    note:
      isTopQuartile
        ? 'Your ACT score is above this school\'s 75th percentile, which significantly improves merit aid eligibility.'
        : 'Merit aid estimate is based on GPA/ACT brackets and school aid data from College Scorecard.',
  };
}
