export interface ProjectionInput {
  annualCOA: number;
  coaInflationRate: number;
  athleticScholarshipPct: number;
  meritAidAnnual: number;
  expectedAnnualContrib: number;
}

export interface YearProjection {
  year: number;
  inflatedCOA: number;
  athleticAid: number;
  meritAid: number;
  familyContrib: number;
  netCost: number;
  cumulativeDebt: number;
}

export function project4YearCost(input: ProjectionInput): YearProjection[] {
  let cumulativeDebt = 0;

  return [1, 2, 3, 4].map((year) => {
    const inflatedCOA =
      input.annualCOA * Math.pow(1 + input.coaInflationRate, year - 1);
    const athleticAid = inflatedCOA * input.athleticScholarshipPct;
    // Merit aid is not inflation-adjusted (typically fixed in award letters)
    const meritAid = input.meritAidAnnual;
    const familyContrib = input.expectedAnnualContrib;
    const netCost = Math.max(0, inflatedCOA - athleticAid - meritAid - familyContrib);
    cumulativeDebt += netCost;

    return {
      year,
      inflatedCOA: Math.round(inflatedCOA),
      athleticAid: Math.round(athleticAid),
      meritAid: Math.round(meritAid),
      familyContrib: Math.round(familyContrib),
      netCost: Math.round(netCost),
      cumulativeDebt: Math.round(cumulativeDebt),
    };
  });
}
