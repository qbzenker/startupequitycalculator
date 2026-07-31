import type { EquityResult, EquityScenarioInput } from "./types";

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function getFundingRoundMonth(
  input: EquityScenarioInput,
  roundIndex: number,
): number {
  return Math.round(
    (input.exitMonths * roundIndex) / (input.fundingRounds + 1),
  );
}

export function getVestedSharesAtMonth(
  input: EquityScenarioInput,
  month: number,
): number {
  const elapsedMonths = Math.max(0, month);

  if (input.mode === "existing-equity") {
    if (input.remainingVestingMonths === 0) {
      return input.grantShares;
    }

    const remainingShares = input.grantShares - input.vestedSharesToday;
    const progress = clampUnit(
      elapsedMonths / input.remainingVestingMonths,
    );

    return Math.min(
      input.grantShares,
      input.vestedSharesToday + remainingShares * progress,
    );
  }

  if (elapsedMonths < input.cliffMonths) {
    return 0;
  }

  return input.grantShares * clampUnit(elapsedMonths / input.vestingMonths);
}

export function getCompletedRoundsAtMonth(
  input: EquityScenarioInput,
  month: number,
): number {
  let completedRounds = 0;

  for (let roundIndex = 1; roundIndex <= input.fundingRounds; roundIndex += 1) {
    if (getFundingRoundMonth(input, roundIndex) <= month) {
      completedRounds += 1;
    }
  }

  return completedRounds;
}

export function getDilutionFactor(
  input: EquityScenarioInput,
  completedRounds: number,
): number {
  return (1 - input.dilutionPerRound / 100) ** completedRounds;
}

export function calculateEquity(input: EquityScenarioInput): EquityResult {
  const vestedSharesToday = getVestedSharesAtMonth(input, 0);
  const vestedSharesAtExit = getVestedSharesAtMonth(input, input.exitMonths);
  const currentOwnership = vestedSharesToday / input.totalCompanyShares;
  const dilutionFactorAtExit = getDilutionFactor(
    input,
    input.fundingRounds,
  );
  const ownershipAtExit =
    (vestedSharesAtExit / input.totalCompanyShares) * dilutionFactorAtExit;

  const currentGrossValue = input.currentCompanyValue * currentOwnership;
  const currentExerciseCost = vestedSharesToday * input.strikePrice;
  const exitGrossValue = input.exitCompanyValue * ownershipAtExit;
  const exitExerciseCost = vestedSharesAtExit * input.strikePrice;

  return {
    vestedSharesToday,
    vestedSharesAtExit,
    currentOwnership,
    ownershipAtExit,
    currentGrossValue,
    currentExerciseCost,
    currentNetValue: currentGrossValue - currentExerciseCost,
    exitGrossValue,
    exitExerciseCost,
    exitNetValue: exitGrossValue - exitExerciseCost,
    dilutionFactorAtExit,
  };
}
