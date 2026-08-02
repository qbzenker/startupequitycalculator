import {
  EquityCalculationError,
  getCompletedRoundsAtMonth,
  getDilutionFactor,
  getFundingRoundMonths,
  getVestedSharesAtMonth,
} from "./calculate";
import type {
  EquityScenarioInput,
  TimelineEvent,
  TimelinePoint,
} from "./types";

export { getFundingRoundMonths };

function getTimelineMonths(
  exitMonths: number,
  events: readonly TimelineEvent[],
): number[] {
  const months = new Set<number>();

  for (let month = 0; month <= exitMonths; month += 3) {
    months.add(month);
  }

  events.forEach((event) => months.add(event.month));
  months.add(exitMonths);
  return [...months].sort((left, right) => left - right);
}

function getCompanyValueAtMonth(
  input: EquityScenarioInput,
  month: number,
): number {
  const progress = month / input.exitMonths;
  const growthMultiple =
    input.exitCompanyValue / input.currentCompanyValue;

  return input.currentCompanyValue * growthMultiple ** progress;
}

function getTimelineEvents(input: EquityScenarioInput): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  if (
    input.mode === "new-offer" &&
    input.cliffMonths > 0 &&
    input.cliffMonths <= input.exitMonths
  ) {
    events.push({
      id: `cliff-${input.cliffMonths}`,
      kind: "cliff",
      month: input.cliffMonths,
      label: `${input.cliffMonths}-month cliff`,
    });
  }

  getFundingRoundMonths(input).forEach((month, index) => {
    events.push({
      id: `funding-${index + 1}-${month}`,
      kind: "funding",
      month,
      label: `Funding round ${index + 1}`,
    });
  });

  const fullyVestedMonth =
    input.mode === "new-offer"
      ? input.vestingMonths
      : input.remainingVestingMonths;

  if (fullyVestedMonth <= input.exitMonths) {
    events.push({
      id: `fully-vested-${fullyVestedMonth}`,
      kind: "fully-vested",
      month: fullyVestedMonth,
      label: "Fully vested",
    });
  }

  events.push({
    id: `exit-${input.exitMonths}`,
    kind: "exit",
    month: input.exitMonths,
    label: "Modeled exit",
  });

  return events.sort((left, right) => left.month - right.month);
}

export function generateTimeline(input: EquityScenarioInput): {
  points: TimelinePoint[];
  events: TimelineEvent[];
} {
  const events = getTimelineEvents(input);
  const points = getTimelineMonths(input.exitMonths, events).map((month) => {
    const companyValue = getCompanyValueAtMonth(input, month);
    const vestedShares = getVestedSharesAtMonth(input, month);
    const completedRounds = getCompletedRoundsAtMonth(input, month);
    const ownership =
      (vestedShares / input.totalCompanyShares) *
      getDilutionFactor(input, completedRounds);
    const grossValue = companyValue * ownership;
    const exerciseCost = vestedShares * input.strikePrice;

    return {
      month,
      companyValue,
      vestedShares,
      completedRounds,
      ownership,
      grossValue,
      exerciseCost,
      netValue: grossValue - exerciseCost,
    };
  });

  if (
    points.some((point) =>
      Object.values(point).some((value) => !Number.isFinite(value)),
    )
  ) {
    throw new EquityCalculationError();
  }

  return {
    points,
    events,
  };
}
