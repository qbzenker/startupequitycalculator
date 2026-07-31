export type EquityMode = "new-offer" | "existing-equity";

export interface EquityScenarioInput {
  mode: EquityMode;
  grantShares: number;
  strikePrice: number;
  totalCompanyShares: number;
  currentCompanyValue: number;
  exitCompanyValue: number;
  exitMonths: number;
  fundingRounds: number;
  dilutionPerRound: number;
  vestingMonths: number;
  cliffMonths: number;
  vestedSharesToday: number;
  remainingVestingMonths: number;
}

export interface EquityResult {
  vestedSharesToday: number;
  vestedSharesAtExit: number;
  currentOwnership: number;
  ownershipAtExit: number;
  currentGrossValue: number;
  currentExerciseCost: number;
  currentNetValue: number;
  exitGrossValue: number;
  exitExerciseCost: number;
  exitNetValue: number;
  dilutionFactorAtExit: number;
}

export type TimelineEventKind =
  | "cliff"
  | "funding"
  | "fully-vested"
  | "exit";

export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  month: number;
  label: string;
}

export interface TimelinePoint {
  month: number;
  companyValue: number;
  vestedShares: number;
  completedRounds: number;
  ownership: number;
  grossValue: number;
  exerciseCost: number;
  netValue: number;
}

export interface ScenarioPreset {
  id: "early-employee" | "series-a" | "growth-stage" | "conservative";
  label: string;
  description: string;
  input: EquityScenarioInput;
}

export interface SavedScenario {
  id: string;
  name: string;
  color: string;
  input: EquityScenarioInput;
  result: EquityResult;
  timeline: TimelinePoint[];
}
