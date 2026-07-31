import { describe, expect, it } from "vitest";

import type { EquityScenarioInput } from "./types";
import { equityScenarioSchema, parseScenario } from "./schema";

const VALID_SCENARIO: EquityScenarioInput = {
  mode: "new-offer",
  grantShares: 20_000,
  strikePrice: 1.25,
  totalCompanyShares: 20_000_000,
  currentCompanyValue: 120_000_000,
  exitCompanyValue: 1_500_000_000,
  exitMonths: 48,
  fundingRounds: 2,
  dilutionPerRound: 18,
  vestingMonths: 48,
  cliffMonths: 12,
  vestedSharesToday: 0,
  remainingVestingMonths: 48,
};

describe("equityScenarioSchema", () => {
  it("accepts the approved Series A scenario", () => {
    expect(parseScenario(VALID_SCENARIO)).toEqual(VALID_SCENARIO);
  });

  it("requires positive grant, share-count, valuation, and timing values", () => {
    for (const field of [
      "grantShares",
      "totalCompanyShares",
      "currentCompanyValue",
      "exitCompanyValue",
      "exitMonths",
      "vestingMonths",
    ] as const) {
      const parsed = equityScenarioSchema.safeParse({
        ...VALID_SCENARIO,
        [field]: 0,
      });

      expect(parsed.success, field).toBe(false);
    }
  });

  it("allows zero strike, rounds, dilution, vested shares, and remaining vesting", () => {
    const parsed = equityScenarioSchema.safeParse({
      ...VALID_SCENARIO,
      strikePrice: 0,
      fundingRounds: 0,
      dilutionPerRound: 0,
      vestedSharesToday: 0,
      remainingVestingMonths: 0,
    });

    expect(parsed.success).toBe(true);
  });

  it("limits funding rounds to whole numbers from zero through ten", () => {
    expect(
      equityScenarioSchema.safeParse({
        ...VALID_SCENARIO,
        fundingRounds: 10,
      }).success,
    ).toBe(true);
    expect(
      equityScenarioSchema.safeParse({
        ...VALID_SCENARIO,
        fundingRounds: 11,
      }).success,
    ).toBe(false);
    expect(
      equityScenarioSchema.safeParse({
        ...VALID_SCENARIO,
        fundingRounds: 1.5,
      }).success,
    ).toBe(false);
  });

  it("allows zero dilution and rejects 100 percent", () => {
    expect(
      equityScenarioSchema.safeParse({
        ...VALID_SCENARIO,
        dilutionPerRound: 0,
      }).success,
    ).toBe(true);
    expect(
      equityScenarioSchema.safeParse({
        ...VALID_SCENARIO,
        dilutionPerRound: 100,
      }).success,
    ).toBe(false);
  });

  it("rejects a cliff longer than the vesting term", () => {
    const parsed = equityScenarioSchema.safeParse({
      ...VALID_SCENARIO,
      cliffMonths: 49,
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects vested shares above the grant", () => {
    const parsed = equityScenarioSchema.safeParse({
      ...VALID_SCENARIO,
      mode: "existing-equity",
      vestedSharesToday: VALID_SCENARIO.grantShares + 1,
    });

    expect(parsed.success).toBe(false);
  });

  it("limits the modeled exit to fifteen years", () => {
    expect(
      equityScenarioSchema.safeParse({
        ...VALID_SCENARIO,
        exitMonths: 180,
      }).success,
    ).toBe(true);
    expect(
      equityScenarioSchema.safeParse({
        ...VALID_SCENARIO,
        exitMonths: 181,
      }).success,
    ).toBe(false);
  });

  it("rejects non-finite numbers", () => {
    expect(
      equityScenarioSchema.safeParse({
        ...VALID_SCENARIO,
        exitCompanyValue: Number.POSITIVE_INFINITY,
      }).success,
    ).toBe(false);
  });
});
