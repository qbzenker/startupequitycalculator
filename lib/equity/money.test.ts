import { describe, expect, it } from "vitest";

import { parseMoneyDraft } from "./money";

describe("parseMoneyDraft", () => {
  it.each([
    ["120000000", 120_000_000],
    ["$120,000,000", 120_000_000],
    ["120m", 120_000_000],
    ["1.2B", 1_200_000_000],
    [" 1.5 b ", 1_500_000_000],
    ["12.75", 13],
    ["$120,000,000.49", 120_000_000],
    ["1.2345b", 1_234_500_000],
  ])("parses %s as whole base dollars", (draft, expected) => {
    expect(parseMoneyDraft(draft)).toBe(expected);
  });

  it("rounds after applying shorthand", () => {
    expect(parseMoneyDraft("0.0000015m")).toBe(2);
  });

  it.each(["", "$", "1.2t", "money", "-4m"])(
    "returns null for incomplete or unsupported input %s",
    (draft) => {
      expect(parseMoneyDraft(draft)).toBeNull();
    },
  );
});
