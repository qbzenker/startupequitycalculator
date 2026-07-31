import type {
  EquityMode,
  EquityScenarioInput,
  ScenarioPreset,
} from "./types";

const DEFAULT_VESTING = {
  mode: "new-offer",
  vestingMonths: 48,
  cliffMonths: 12,
  vestedSharesToday: 0,
  remainingVestingMonths: 48,
} as const;

export const PRESETS = [
  {
    id: "early-employee",
    label: "Early employee",
    description: "A larger early grant with a longer path and heavier dilution.",
    input: {
      ...DEFAULT_VESTING,
      grantShares: 40_000,
      strikePrice: 0.2,
      totalCompanyShares: 10_000_000,
      currentCompanyValue: 40_000_000,
      exitCompanyValue: 500_000_000,
      exitMonths: 60,
      fundingRounds: 3,
      dilutionPerRound: 20,
    },
  },
  {
    id: "series-a",
    label: "Series A · typical",
    description: "A balanced starting point for an early-stage offer.",
    input: {
      ...DEFAULT_VESTING,
      grantShares: 20_000,
      strikePrice: 1.25,
      totalCompanyShares: 20_000_000,
      currentCompanyValue: 120_000_000,
      exitCompanyValue: 1_500_000_000,
      exitMonths: 48,
      fundingRounds: 2,
      dilutionPerRound: 18,
    },
  },
  {
    id: "growth-stage",
    label: "Growth stage",
    description: "A smaller grant at a more established company.",
    input: {
      ...DEFAULT_VESTING,
      grantShares: 8_000,
      strikePrice: 6,
      totalCompanyShares: 80_000_000,
      currentCompanyValue: 1_200_000_000,
      exitCompanyValue: 4_000_000_000,
      exitMonths: 36,
      fundingRounds: 1,
      dilutionPerRound: 12,
    },
  },
  {
    id: "conservative",
    label: "Conservative case",
    description: "The Series A grant with a modest exit and heavier dilution.",
    input: {
      ...DEFAULT_VESTING,
      grantShares: 20_000,
      strikePrice: 1.25,
      totalCompanyShares: 20_000_000,
      currentCompanyValue: 120_000_000,
      exitCompanyValue: 400_000_000,
      exitMonths: 48,
      fundingRounds: 2,
      dilutionPerRound: 20,
    },
  },
] as const satisfies readonly ScenarioPreset[];

export const DEFAULT_PRESET = PRESETS[1];

const SCENARIO_FIELDS = [
  "mode",
  "grantShares",
  "strikePrice",
  "totalCompanyShares",
  "currentCompanyValue",
  "exitCompanyValue",
  "exitMonths",
  "fundingRounds",
  "dilutionPerRound",
  "vestingMonths",
  "cliffMonths",
  "vestedSharesToday",
  "remainingVestingMonths",
] as const satisfies readonly (keyof EquityScenarioInput)[];

export function getPresetInput(
  id: ScenarioPreset["id"],
): EquityScenarioInput {
  const preset = PRESETS.find((candidate) => candidate.id === id);

  if (!preset) {
    throw new Error(`Unknown equity preset: ${id}`);
  }

  return { ...preset.input };
}

export function findMatchingPreset(
  input: EquityScenarioInput,
): ScenarioPreset | undefined {
  return PRESETS.find((preset) =>
    SCENARIO_FIELDS.every((field) => preset.input[field] === input[field]),
  );
}

export function changeScenarioMode(
  input: EquityScenarioInput,
  mode: EquityMode,
): EquityScenarioInput {
  if (input.mode === mode) {
    return { ...input };
  }

  return {
    ...input,
    mode,
    vestedSharesToday: 0,
    remainingVestingMonths: input.vestingMonths,
  };
}
