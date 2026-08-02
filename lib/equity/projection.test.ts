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

  it("keeps today's timeline point aligned with the headline on short horizons", () => {
    const projection = buildEquityProjection({
      ...DEFAULT_PRESET.input,
      mode: "existing-equity",
      vestedSharesToday: 5_000,
      remainingVestingMonths: 12,
      exitMonths: 1,
      fundingRounds: 10,
    });
    const today = projection.timeline.points.find(
      (point) => point.month === 0,
    );
    const fundingEvents = projection.timeline.events.filter(
      (event) => event.kind === "funding",
    );

    expect(today?.ownership).toBeCloseTo(
      projection.result.currentOwnership,
    );
    expect(today?.netValue).toBeCloseTo(
      projection.result.currentNetValue,
    );
    expect(fundingEvents).toHaveLength(10);
    expect(
      fundingEvents.every((event) => event.month > 0 && event.month <= 1),
    ).toBe(true);
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
