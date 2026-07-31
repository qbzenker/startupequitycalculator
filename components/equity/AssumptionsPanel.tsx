"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import type { EquityScenarioFormValues } from "./useEquityStudio";
import { NumberField } from "./NumberField";

interface AssumptionsPanelProps {
  form: UseFormReturn<EquityScenarioFormValues>;
  issues: Map<string, string>;
  onReset: () => void;
  onFieldChange: (
    name: NumericFieldName,
    value: number | null,
  ) => void;
}

type NumericFieldName = Exclude<
  keyof EquityScenarioFormValues,
  "mode"
>;

interface FieldDefinition {
  name: NumericFieldName;
  label: string;
  description?: string;
  prefix?: string;
  suffix?: string;
  decimalScale?: number;
}

const ESSENTIAL_FIELDS: FieldDefinition[] = [
  {
    name: "grantShares",
    label: "Grant size",
    description: "The total options or shares in the grant.",
  },
  {
    name: "strikePrice",
    label: "Strike price",
    description: "What you pay to exercise one option.",
    prefix: "$",
    decimalScale: 2,
  },
  {
    name: "totalCompanyShares",
    label: "Fully diluted company shares",
  },
  {
    name: "currentCompanyValue",
    label: "Company value today",
    prefix: "$",
  },
  {
    name: "exitCompanyValue",
    label: "Potential exit value",
    prefix: "$",
  },
  {
    name: "exitMonths",
    label: "Time to exit",
    suffix: " months",
  },
  {
    name: "fundingRounds",
    label: "Future funding rounds",
  },
  {
    name: "dilutionPerRound",
    label: "Dilution per round",
    suffix: "%",
    decimalScale: 1,
  },
];

const VESTING_FIELDS: FieldDefinition[] = [
  {
    name: "vestingMonths",
    label: "Total vesting term",
    suffix: " months",
  },
  {
    name: "cliffMonths",
    label: "Vesting cliff",
    suffix: " months",
  },
];

function ControlledNumberField({
  field,
  form,
  issues,
  onFieldChange,
}: {
  field: FieldDefinition;
  form: UseFormReturn<EquityScenarioFormValues>;
  issues: Map<string, string>;
  onFieldChange: AssumptionsPanelProps["onFieldChange"];
}) {
  const touched = form.formState.touchedFields[field.name];
  const error = touched ? issues.get(field.name) : undefined;

  return (
    <Controller
      name={field.name}
      control={form.control}
      render={({ field: controllerField }) => (
        <NumberField
          id={field.name}
          label={field.label}
          description={field.description}
          value={controllerField.value}
          onChange={(value) => {
            controllerField.onChange(value);
            onFieldChange(field.name, value);
          }}
          onBlur={controllerField.onBlur}
          prefix={field.prefix}
          suffix={field.suffix}
          decimalScale={field.decimalScale}
          error={error}
        />
      )}
    />
  );
}

export function AssumptionsPanel({
  form,
  issues,
  onFieldChange,
  onReset,
}: AssumptionsPanelProps) {
  const mode = form.watch("mode");

  return (
    <section className="assumptions-panel" aria-labelledby="assumptions-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">The model underneath</p>
          <h2 id="assumptions-title">Your assumptions</h2>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={onReset}
        >
          Reset
        </button>
      </div>

      <div className="field-list">
        {ESSENTIAL_FIELDS.map((field) => (
          <ControlledNumberField
            key={field.name}
            field={field}
            form={form}
            issues={issues}
            onFieldChange={onFieldChange}
          />
        ))}
      </div>

      {mode === "existing-equity" ? (
        <div className="field-list mode-specific-fields">
          <ControlledNumberField
            field={{
              name: "vestedSharesToday",
              label: "Vested shares today",
              description: "Shares you could exercise right now.",
            }}
            form={form}
            issues={issues}
            onFieldChange={onFieldChange}
          />
          <ControlledNumberField
            field={{
              name: "remainingVestingMonths",
              label: "Remaining vesting",
              suffix: " months",
            }}
            form={form}
            issues={issues}
            onFieldChange={onFieldChange}
          />
        </div>
      ) : null}

      <details className="advanced-assumptions">
        <summary>Vesting & cap table details</summary>
        <div className="field-list">
          {VESTING_FIELDS.map((field) => (
            <ControlledNumberField
              key={field.name}
              field={field}
              form={form}
              issues={issues}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      </details>
    </section>
  );
}
