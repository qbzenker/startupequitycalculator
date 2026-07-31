import {
  getCompletedRoundsAtMonth,
  getDilutionFactor,
  getVestedSharesAtMonth,
} from "./calculate";
import type {
  EquityScenarioInput,
  TimelineEvent,
  TimelinePoint,
} from "./types";

export function getFundingRoundMonths(
  input: EquityScenarioInput,
): number[] {
  return Array.from({ length: input.fundingRounds }, (_, index) =>
    Math.round(
      (input.exitMonths * (index + 1)) / (input.fundingRounds + 1),
    ),
  );
}

function getTimelineMonths(exitMonths: number): number[] {
  const months = new Set<number>();

  for (let month = 0; month <= exitMonths; month += 3) {
    months.add(month);
  }

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
  const points = getTimelineMonths(input.exitMonths).map((month) => {
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

  return {
    points,
    events: getTimelineEvents(input),
  };
}
