import { describe, expect, it } from "vitest";

import { DEFAULT_PRESET } from "./presets";
import { buildEquityProjection } from "./projection";

describe("buildEquityProjection", () => {
  it("returns the calculated result and timeline for a valid scenario", () => {
    const projection = buildEquityProjection(DEFAULT_PRESET.input);

    expect(projection.error).toBeUndefined();
    expect(projection.result.exitNetValue).toBeCloseTo(983_600);
    expect(projection.timeline.points.at(-1)?.month).toBe(48);
  });

  it("returns a finite empty fallback after an unexpected calculation error", () => {
    const projection = buildEquityProjection({
      ...DEFAULT_PRESET.input,
      grantShares: 1e308,
      strikePrice: 1e308,
      totalCompanyShares: 1,
      currentCompanyValue: 1e308,
      exitCompanyValue: 1e308,
    });

    expect(projection.error).toMatch(/couldn't model/i);
    expect(Object.values(projection.result).every(Number.isFinite)).toBe(true);
    expect(projection.timeline).toEqual({ points: [], events: [] });
  });
});
