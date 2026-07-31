import { calculateEquity } from "./calculate";
import { generateTimeline } from "./timeline";
import type { EquityScenarioInput, SavedScenario } from "./types";

export const MAX_SAVED_SCENARIOS = 2;

const SNAPSHOT_COLORS = ["#DF7253", "#D5A538"] as const;

export class ComparisonLimitError extends Error {
  constructor() {
    super(
      "Two snapshots are already saved. Remove one before saving the active scenario again.",
    );
    this.name = "ComparisonLimitError";
  }
}

function getNextSlot(saved: readonly SavedScenario[]): number {
  let slot = 1;

  while (saved.some((scenario) => scenario.id === `saved-${slot}`)) {
    slot += 1;
  }

  return slot;
}

function getGeneratedName(saved: readonly SavedScenario[]): string {
  if (!saved.some((scenario) => scenario.name === "Baseline")) {
    return "Baseline";
  }

  return "Scenario 2";
}

export function saveScenario(
  saved: readonly SavedScenario[],
  input: EquityScenarioInput,
  name?: string,
): SavedScenario[] {
  if (saved.length >= MAX_SAVED_SCENARIOS) {
    throw new ComparisonLimitError();
  }

  const slot = getNextSlot(saved);
  const snapshotInput = { ...input };
  const timeline = generateTimeline(snapshotInput);
  const providedName = name?.trim();

  return [
    ...saved,
    {
      id: `saved-${slot}`,
      name: providedName || getGeneratedName(saved),
      color: SNAPSHOT_COLORS[slot - 1] ?? SNAPSHOT_COLORS[0],
      input: snapshotInput,
      result: calculateEquity(snapshotInput),
      timeline: timeline.points,
    },
  ];
}

export function renameScenario(
  saved: readonly SavedScenario[],
  id: string,
  name: string,
): SavedScenario[] {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return [...saved];
  }

  return saved.map((scenario) =>
    scenario.id === id ? { ...scenario, name: trimmedName } : scenario,
  );
}

export function removeScenario(
  saved: readonly SavedScenario[],
  id: string,
): SavedScenario[] {
  return saved.filter((scenario) => scenario.id !== id);
}
