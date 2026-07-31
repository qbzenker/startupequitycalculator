"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { calculateEquity } from "@/lib/equity/calculate";
import {
  DEFAULT_PRESET,
  changeScenarioMode,
  findMatchingPreset,
  getPresetInput,
} from "@/lib/equity/presets";
import { equityScenarioSchema } from "@/lib/equity/schema";
import { generateTimeline } from "@/lib/equity/timeline";
import type {
  EquityMode,
  EquityScenarioInput,
  ScenarioPreset,
} from "@/lib/equity/types";

type NumericScenarioField = Exclude<keyof EquityScenarioInput, "mode">;

export type EquityScenarioFormValues = {
  mode: EquityMode;
} & Record<NumericScenarioField, number | null>;

function toFormValues(
  input: EquityScenarioInput,
): EquityScenarioFormValues {
  return { ...input };
}

function getInputKey(input: EquityScenarioInput): string {
  return JSON.stringify(input);
}

export function useEquityStudio() {
  const form = useForm<EquityScenarioFormValues>({
    defaultValues: toFormValues({ ...DEFAULT_PRESET.input }),
    mode: "onBlur",
  });
  const watched = useWatch({ control: form.control });
  const parsed = equityScenarioSchema.safeParse(watched);
  const [lastValidInput, setLastValidInput] = useState<EquityScenarioInput>({
    ...DEFAULT_PRESET.input,
  });

  const validInput = parsed.success ? parsed.data : lastValidInput;
  const result = calculateEquity(validInput);
  const timeline = generateTimeline(validInput);
  const activePreset = parsed.success
    ? findMatchingPreset(parsed.data)
    : undefined;

  const issues = parsed.success
    ? new Map<string, string>()
    : new Map(
        parsed.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      );

  function selectPreset(id: ScenarioPreset["id"]) {
    const nextInput = getPresetInput(id);
    setLastValidInput(nextInput);
    form.reset(toFormValues(nextInput));
  }

  function setMode(mode: EquityMode) {
    const nextInput = changeScenarioMode(validInput, mode);
    setLastValidInput(nextInput);
    form.reset(toFormValues(nextInput));
  }

  function updateLastValidField(
    name: NumericScenarioField,
    value: number | null,
  ) {
    const nextParsed = equityScenarioSchema.safeParse({
      ...form.getValues(),
      [name]: value,
    });

    if (nextParsed.success) {
      setLastValidInput((current) =>
        getInputKey(current) === getInputKey(nextParsed.data)
          ? current
          : nextParsed.data,
      );
    }
  }

  return {
    form,
    watched,
    validInput,
    result,
    timeline,
    activePreset,
    issues,
    isUsingPreviousResult: !parsed.success,
    selectPreset,
    setMode,
    updateLastValidField,
  };
}
