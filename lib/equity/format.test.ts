import { describe, expect, it } from "vitest";

import {
  formatCompactCurrency,
  formatCurrency,
  formatOwnership,
  formatShares,
} from "./format";

describe("equity formatters", () => {
  it("formats positive and negative whole-dollar values", () => {
    expect(formatCurrency(2_361_176)).toBe("$2,361,176");
    expect(formatCurrency(-1_250)).toBe("-$1,250");
  });

  it("uses compact suffixes without hiding meaningful precision", () => {
    expect(formatCompactCurrency(2_361_176)).toBe("$2.36M");
    expect(formatCompactCurrency(111_647)).toBe("$111.6K");
  });

  it("formats shares and fractional ownership", () => {
    expect(formatShares(20_000)).toBe("20,000");
    expect(formatOwnership(0.00079)).toBe("0.079%");
  });
});
