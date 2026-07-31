import { calculateEquity } from "./calculate";
import { generateTimeline } from "./timeline";
import type {
  EquityResult,
  EquityScenarioInput,
  TimelineEvent,
  TimelinePoint,
} from "./types";

const EMPTY_RESULT: EquityResult = {
  vestedSharesToday: 0,
  vestedSharesAtExit: 0,
  currentOwnership: 0,
  ownershipAtExit: 0,
  currentGrossValue: 0,
  currentExerciseCost: 0,
  currentNetValue: 0,
  exitGrossValue: 0,
  exitExerciseCost: 0,
  exitNetValue: 0,
  dilutionFactorAtExit: 0,
};

export interface EquityProjection {
  result: EquityResult;
  timeline: {
    points: TimelinePoint[];
    events: TimelineEvent[];
  };
  error?: string;
}

export function buildEquityProjection(
  input: EquityScenarioInput,
): EquityProjection {
  try {
    return {
      result: calculateEquity(input),
      timeline: generateTimeline(input),
    };
  } catch {
    return {
      result: { ...EMPTY_RESULT },
      timeline: { points: [], events: [] },
      error:
        "We couldn't model these assumptions safely. Reset the scenario and try again.",
    };
  }
}
