import { describe, expect, it } from "vitest";

import {
  DEFAULT_PRESET,
  PRESETS,
  changeScenarioMode,
  findMatchingPreset,
  getPresetInput,
} from "./presets";

describe("scenario presets", () => {
  it("ships the four approved starting points", () => {
    expect(PRESETS.map((preset) => preset.label)).toEqual([
      "Early employee",
      "Series A · typical",
      "Growth stage",
      "Conservative case",
    ]);
  });

  it("uses Series A as the default", () => {
    expect(DEFAULT_PRESET.id).toBe("series-a");
    expect(DEFAULT_PRESET.input).toMatchObject({
      grantShares: 20_000,
      strikePrice: 1.25,
      totalCompanyShares: 20_000_000,
      currentCompanyValue: 120_000_000,
      exitCompanyValue: 1_500_000_000,
      exitMonths: 48,
      fundingRounds: 2,
      dilutionPerRound: 18,
    });
  });

  it("matches a preset only when every scenario value matches", () => {
    expect(findMatchingPreset(DEFAULT_PRESET.input)?.id).toBe("series-a");
    expect(
      findMatchingPreset({
        ...DEFAULT_PRESET.input,
        exitCompanyValue: DEFAULT_PRESET.input.exitCompanyValue + 1,
      }),
    ).toBeUndefined();
  });

  it("returns cloned preset values", () => {
    const first = getPresetInput("series-a");
    first.grantShares = 1;

    expect(getPresetInput("series-a").grantShares).toBe(20_000);
  });

  it("preserves compatible values when switching to existing equity", () => {
    const changed = changeScenarioMode(
      DEFAULT_PRESET.input,
      "existing-equity",
    );

    expect(changed.mode).toBe("existing-equity");
    expect(changed.grantShares).toBe(DEFAULT_PRESET.input.grantShares);
    expect(changed.currentCompanyValue).toBe(
      DEFAULT_PRESET.input.currentCompanyValue,
    );
    expect(changed.vestedSharesToday).toBe(0);
    expect(changed.remainingVestingMonths).toBe(48);
  });

  it("resets mode-specific fields when returning to a new offer", () => {
    const changed = changeScenarioMode(
      {
        ...DEFAULT_PRESET.input,
        mode: "existing-equity",
        vestedSharesToday: 7_500,
        remainingVestingMonths: 18,
      },
      "new-offer",
    );

    expect(changed).toMatchObject({
      mode: "new-offer",
      vestedSharesToday: 0,
      remainingVestingMonths: 48,
    });
  });
});
