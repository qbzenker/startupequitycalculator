import { describe, expect, it } from "vitest";

import { calculateEquity } from "./calculate";
import { DEFAULT_PRESET } from "./presets";
import { generateTimeline, getFundingRoundMonths } from "./timeline";

describe("getFundingRoundMonths", () => {
  it("evenly places two rounds before a 48-month exit", () => {
    expect(getFundingRoundMonths(DEFAULT_PRESET.input)).toEqual([16, 32]);
  });

  it("returns no events when no future rounds are modeled", () => {
    expect(
      getFundingRoundMonths({
        ...DEFAULT_PRESET.input,
        fundingRounds: 0,
      }),
    ).toEqual([]);
  });
});

describe("generateTimeline", () => {
  it("includes quarterly points from today through the exact exit", () => {
    const { points } = generateTimeline(DEFAULT_PRESET.input);

    expect(points[0]?.month).toBe(0);
    expect(points.at(-1)?.month).toBe(48);
    expect(points.map((point) => point.month)).toEqual([
      0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48,
    ]);
  });

  it("appends a non-quarter exit exactly once", () => {
    const { points } = generateTimeline({
      ...DEFAULT_PRESET.input,
      exitMonths: 50,
    });

    expect(points.at(-2)?.month).toBe(48);
    expect(points.at(-1)?.month).toBe(50);
    expect(points.filter((point) => point.month === 50)).toHaveLength(1);
  });

  it("uses compound interpolation for company value", () => {
    const { points } = generateTimeline(DEFAULT_PRESET.input);
    const midpoint = points.find((point) => point.month === 24);

    expect(midpoint?.companyValue).toBeCloseTo(
      Math.sqrt(
        DEFAULT_PRESET.input.currentCompanyValue *
          DEFAULT_PRESET.input.exitCompanyValue,
      ),
    );
  });

  it("applies funding dilution only after each event month", () => {
    const { points } = generateTimeline(DEFAULT_PRESET.input);

    expect(
      points.find((point) => point.month === 15)?.completedRounds,
    ).toBe(0);
    expect(
      points.find((point) => point.month === 18)?.completedRounds,
    ).toBe(1);
    expect(
      points.find((point) => point.month === 33)?.completedRounds,
    ).toBe(2);
  });

  it("matches the calculation engine at the exit endpoint", () => {
    const expected = calculateEquity(DEFAULT_PRESET.input);
    const { points } = generateTimeline(DEFAULT_PRESET.input);
    const exit = points.at(-1);

    expect(exit?.vestedShares).toBe(expected.vestedSharesAtExit);
    expect(exit?.ownership).toBeCloseTo(expected.ownershipAtExit);
    expect(exit?.grossValue).toBeCloseTo(expected.exitGrossValue);
    expect(exit?.exerciseCost).toBeCloseTo(expected.exitExerciseCost);
    expect(exit?.netValue).toBeCloseTo(expected.exitNetValue);
  });

  it("creates cliff, funding, full-vesting, and exit events", () => {
    const { events } = generateTimeline(DEFAULT_PRESET.input);

    expect(
      events.map(({ kind, month }) => ({ kind, month })),
    ).toEqual([
      { kind: "cliff", month: 12 },
      { kind: "funding", month: 16 },
      { kind: "funding", month: 32 },
      { kind: "fully-vested", month: 48 },
      { kind: "exit", month: 48 },
    ]);
  });

  it("retains full-vesting and exit as distinct events at the same month", () => {
    const { events } = generateTimeline(DEFAULT_PRESET.input);

    expect(events.filter((event) => event.month === 48)).toHaveLength(2);
    expect(events.map((event) => event.id)).toEqual(
      expect.arrayContaining(["fully-vested-48", "exit-48"]),
    );
  });

  it("rejects non-finite timeline points if validation is bypassed", () => {
    expect(() =>
      generateTimeline({
        ...DEFAULT_PRESET.input,
        grantShares: 1e308,
        strikePrice: 1e308,
        totalCompanyShares: 1,
        currentCompanyValue: 1e308,
        exitCompanyValue: 1e308,
      }),
    ).toThrow("finite");
  });
});
