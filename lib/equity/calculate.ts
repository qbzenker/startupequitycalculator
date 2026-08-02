import type { EquityResult, EquityScenarioInput } from "./types";

export class EquityCalculationError extends Error {
  constructor() {
    super("Equity calculations must produce finite values");
    this.name = "EquityCalculationError";
  }
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function getFundingRoundMonths(
  input: EquityScenarioInput,
): number[] {
  return Array.from(
    { length: input.fundingRounds },
    (_, index) =>
      (input.exitMonths * (index + 1)) / (input.fundingRounds + 1),
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
  return getFundingRoundMonths(input).filter(
    (roundMonth) => roundMonth <= month,
  ).length;
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

  const result = {
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

  if (Object.values(result).some((value) => !Number.isFinite(value))) {
    throw new EquityCalculationError();
  }

  return result;
}
