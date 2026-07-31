import { describe, expect, it } from "vitest";

import {
  ComparisonLimitError,
  MAX_SAVED_SCENARIOS,
  removeScenario,
  renameScenario,
  saveScenario,
} from "./comparisons";
import { DEFAULT_PRESET } from "./presets";
import type { EquityScenarioInput } from "./types";

describe("scenario comparisons", () => {
  it("saves an immutable Baseline snapshot with calculated data", () => {
    const source: EquityScenarioInput = { ...DEFAULT_PRESET.input };
    const saved = saveScenario([], source);

    source.exitCompanyValue = 1;

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      id: "saved-1",
      name: "Baseline",
      color: "#DF7253",
    });
    expect(saved[0]?.input.exitCompanyValue).toBe(1_500_000_000);
    expect(saved[0]?.result.exitNetValue).toBeCloseTo(983_600);
    expect(saved[0]?.timeline.at(-1)?.month).toBe(48);
  });

  it("allows two saved snapshots alongside the active scenario", () => {
    const first = saveScenario([], DEFAULT_PRESET.input);
    const second = saveScenario(first, {
      ...DEFAULT_PRESET.input,
      exitCompanyValue: 2_000_000_000,
    });

    expect(MAX_SAVED_SCENARIOS).toBe(2);
    expect(second.map((scenario) => scenario.name)).toEqual([
      "Baseline",
      "Scenario 2",
    ]);
    expect(second[1]?.color).toBe("#D5A538");
  });

  it("rejects a third saved snapshot because the active scenario is visible", () => {
    const first = saveScenario([], DEFAULT_PRESET.input);
    const second = saveScenario(first, {
      ...DEFAULT_PRESET.input,
      exitCompanyValue: 2_000_000_000,
    });

    expect(() =>
      saveScenario(second, {
        ...DEFAULT_PRESET.input,
        exitCompanyValue: 3_000_000_000,
      }),
    ).toThrow(ComparisonLimitError);
  });

  it("trims a renamed scenario and ignores an empty name", () => {
    const saved = saveScenario([], DEFAULT_PRESET.input);
    const renamed = renameScenario(saved, "saved-1", "  Lower exit  ");
    const unchanged = renameScenario(renamed, "saved-1", "   ");

    expect(renamed[0]?.name).toBe("Lower exit");
    expect(unchanged[0]?.name).toBe("Lower exit");
  });

  it("removes only the targeted scenario", () => {
    const first = saveScenario([], DEFAULT_PRESET.input);
    const second = saveScenario(first, {
      ...DEFAULT_PRESET.input,
      exitCompanyValue: 2_000_000_000,
    });

    expect(removeScenario(second, "saved-1").map(({ id }) => id)).toEqual([
      "saved-2",
    ]);
  });
});
