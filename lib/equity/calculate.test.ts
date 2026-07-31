import { describe, expect, it } from "vitest";

import { DEFAULT_PRESET } from "./presets";
import {
  calculateEquity,
  getCompletedRoundsAtMonth,
  getDilutionFactor,
  getVestedSharesAtMonth,
} from "./calculate";

describe("getVestedSharesAtMonth", () => {
  it("vests nothing before a new-offer cliff", () => {
    expect(getVestedSharesAtMonth(DEFAULT_PRESET.input, 0)).toBe(0);
    expect(getVestedSharesAtMonth(DEFAULT_PRESET.input, 11)).toBe(0);
  });

  it("vests the proportional cliff amount at month 12", () => {
    expect(getVestedSharesAtMonth(DEFAULT_PRESET.input, 12)).toBe(5_000);
  });

  it("vests linearly after the cliff and caps at the grant", () => {
    expect(getVestedSharesAtMonth(DEFAULT_PRESET.input, 15)).toBe(6_250);
    expect(getVestedSharesAtMonth(DEFAULT_PRESET.input, 48)).toBe(20_000);
    expect(getVestedSharesAtMonth(DEFAULT_PRESET.input, 84)).toBe(20_000);
  });

  it("grows an existing grant from today's vested count", () => {
    const existing = {
      ...DEFAULT_PRESET.input,
      mode: "existing-equity" as const,
      vestedSharesToday: 5_000,
      remainingVestingMonths: 12,
    };

    expect(getVestedSharesAtMonth(existing, 0)).toBe(5_000);
    expect(getVestedSharesAtMonth(existing, 6)).toBe(12_500);
    expect(getVestedSharesAtMonth(existing, 12)).toBe(20_000);
  });

  it("treats zero remaining months as fully vested", () => {
    expect(
      getVestedSharesAtMonth(
        {
          ...DEFAULT_PRESET.input,
          mode: "existing-equity",
          vestedSharesToday: 5_000,
          remainingVestingMonths: 0,
        },
        0,
      ),
    ).toBe(20_000);
  });
});

describe("dilution", () => {
  it("places two Series A funding rounds at months 16 and 32", () => {
    expect(getCompletedRoundsAtMonth(DEFAULT_PRESET.input, 15)).toBe(0);
    expect(getCompletedRoundsAtMonth(DEFAULT_PRESET.input, 16)).toBe(1);
    expect(getCompletedRoundsAtMonth(DEFAULT_PRESET.input, 31)).toBe(1);
    expect(getCompletedRoundsAtMonth(DEFAULT_PRESET.input, 32)).toBe(2);
  });

  it("returns no dilution when no rounds have completed", () => {
    expect(getDilutionFactor(DEFAULT_PRESET.input, 0)).toBe(1);
  });

  it("compounds equal dilution across rounds", () => {
    expect(getDilutionFactor(DEFAULT_PRESET.input, 2)).toBeCloseTo(0.6724);
  });
});

describe("calculateEquity", () => {
  it("calculates the approved Series A exit from raw values", () => {
    const result = calculateEquity(DEFAULT_PRESET.input);

    expect(result.vestedSharesToday).toBe(0);
    expect(result.vestedSharesAtExit).toBe(20_000);
    expect(result.currentNetValue).toBe(0);
    expect(result.ownershipAtExit).toBeCloseTo(0.0006724);
    expect(result.exitGrossValue).toBeCloseTo(1_008_600);
    expect(result.exitExerciseCost).toBe(25_000);
    expect(result.exitNetValue).toBeCloseTo(983_600);
  });

  it("calculates an exit before the grant fully vests", () => {
    const result = calculateEquity({
      ...DEFAULT_PRESET.input,
      exitMonths: 24,
      fundingRounds: 0,
    });

    expect(result.vestedSharesAtExit).toBe(10_000);
    expect(result.ownershipAtExit).toBeCloseTo(0.0005);
    expect(result.exitExerciseCost).toBe(12_500);
  });

  it("calculates today's vested value for existing equity", () => {
    const result = calculateEquity({
      ...DEFAULT_PRESET.input,
      mode: "existing-equity",
      vestedSharesToday: 5_000,
      remainingVestingMonths: 12,
    });

    expect(result.currentOwnership).toBeCloseTo(0.00025);
    expect(result.currentGrossValue).toBe(30_000);
    expect(result.currentExerciseCost).toBe(6_250);
    expect(result.currentNetValue).toBe(23_750);
  });

  it("preserves a negative net value", () => {
    const result = calculateEquity({
      ...DEFAULT_PRESET.input,
      strikePrice: 100,
      exitCompanyValue: 1_000_000,
      fundingRounds: 0,
    });

    expect(result.exitGrossValue).toBe(1_000);
    expect(result.exitExerciseCost).toBe(2_000_000);
    expect(result.exitNetValue).toBe(-1_999_000);
  });
});
