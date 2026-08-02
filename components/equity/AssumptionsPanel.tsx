"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import type { EquityScenarioInput } from "@/lib/equity/types";

import { MoneyField } from "./MoneyField";
import { NumberField } from "./NumberField";
import { QuickChoiceField, type NumericChoice } from "./QuickChoiceField";
import { SliderNumberField } from "./SliderNumberField";
import { StepperField } from "./StepperField";
import type { EquityScenarioFormValues } from "./useEquityStudio";

type NumericFieldName = Exclude<keyof EquityScenarioFormValues, "mode">;

interface AssumptionsPanelProps {
  form: UseFormReturn<EquityScenarioFormValues>;
  stableInput: EquityScenarioInput;
  issues: Map<string, string>;
  onReset: () => void;
  onFieldChange: (name: NumericFieldName, value: number | null) => void;
}

interface ControlledFieldProps {
  name: NumericFieldName;
  label: string;
  form: UseFormReturn<EquityScenarioFormValues>;
  issues: Map<string, string>;
  onFieldChange: AssumptionsPanelProps["onFieldChange"];
  description?: string;
  externalDescribedBy?: string;
}

interface ControlledNumberProps extends ControlledFieldProps {
  prefix?: string;
  suffix?: string;
  decimalScale?: number;
}

interface ControlledChoiceProps extends ControlledFieldProps {
  stableInput: EquityScenarioInput;
  choices: readonly NumericChoice[];
  suffix: string;
}

const EXIT_CHOICES = [
  { label: "2 years", value: 24 },
  { label: "3 years", value: 36 },
  { label: "4 years", value: 48 },
  { label: "5 years", value: 60 },
] as const;

const VESTING_CHOICES = [
  { label: "3 years", value: 36 },
  { label: "4 years", value: 48 },
  { label: "5 years", value: 60 },
] as const;

const CLIFF_CHOICES = [
  { label: "None", value: 0 },
  { label: "6 months", value: 6 },
  { label: "12 months", value: 12 },
] as const;

const REMAINING_VESTING_CHOICES = [
  { label: "1 year", value: 12 },
  { label: "2 years", value: 24 },
  { label: "3 years", value: 36 },
  { label: "4 years", value: 48 },
] as const;

const CROSS_FIELD_RELATIONSHIPS = [
  {
    issueOwner: "cliffMonths",
    peer: "vestingMonths",
    isInvalid: (values: EquityScenarioFormValues) =>
      typeof values.cliffMonths === "number" &&
      typeof values.vestingMonths === "number" &&
      values.cliffMonths > values.vestingMonths,
  },
  {
    issueOwner: "vestedSharesToday",
    peer: "grantShares",
    isInvalid: (values: EquityScenarioFormValues) =>
      typeof values.vestedSharesToday === "number" &&
      typeof values.grantShares === "number" &&
      values.vestedSharesToday > values.grantShares,
  },
] as const;

function getError(
  form: UseFormReturn<EquityScenarioFormValues>,
  issues: Map<string, string>,
  name: NumericFieldName,
) {
  const touched = form.formState.touchedFields;

  if (!touched[name]) {
    return undefined;
  }

  const directIssue = issues.get(name);

  if (directIssue) {
    return directIssue;
  }

  const peerRelationship = CROSS_FIELD_RELATIONSHIPS.find(
    (relationship) =>
      relationship.peer === name &&
      !touched[relationship.issueOwner] &&
      relationship.isInvalid(form.getValues()),
  );

  return peerRelationship
    ? issues.get(peerRelationship.issueOwner)
    : undefined;
}

function ControlledNumberField({
  name,
  label,
  form,
  issues,
  onFieldChange,
  description,
  prefix,
  suffix,
  decimalScale,
}: ControlledNumberProps) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <NumberField
          id={name}
          label={label}
          description={description}
          value={field.value}
          error={getError(form, issues, name)}
          prefix={prefix}
          suffix={suffix}
          decimalScale={decimalScale}
          onChange={(value) => {
            field.onChange(value);
            onFieldChange(name, value);
          }}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}

function ControlledMoneyField({
  name,
  label,
  form,
  issues,
  onFieldChange,
  description,
  externalDescribedBy,
}: ControlledFieldProps) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <MoneyField
          id={name}
          label={label}
          description={description}
          externalDescribedBy={externalDescribedBy}
          value={field.value}
          error={getError(form, issues, name)}
          onChange={(value) => {
            field.onChange(value);
            onFieldChange(name, value);
          }}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}

function ControlledChoiceField({
  name,
  label,
  form,
  stableInput,
  issues,
  onFieldChange,
  description,
  choices,
  suffix,
}: ControlledChoiceProps) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <QuickChoiceField
          id={name}
          label={label}
          description={description}
          value={field.value}
          stableValue={stableInput[name]}
          choices={choices}
          suffix={suffix}
          error={getError(form, issues, name)}
          onChange={(value) => {
            field.onChange(value);
            onFieldChange(name, value);
          }}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}

export function AssumptionsPanel({
  form,
  stableInput,
  issues,
  onFieldChange,
  onReset,
}: AssumptionsPanelProps) {
  const mode = form.watch("mode");
  const shared = { form, issues, onFieldChange };

  return (
    <section className="assumptions-panel" aria-labelledby="assumptions-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">The model underneath</p>
          <h2 id="assumptions-title">Your assumptions</h2>
          <p className="assumptions-intro">
            Change any assumption. Results and charts update together.
          </p>
        </div>
        <button type="button" className="text-button" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="assumption-section">
        <div className="assumption-section-heading">
          <p className="assumption-section-index">01</p>
          <h3>Your grant</h3>
        </div>
        <div className="field-list">
          <ControlledNumberField
            {...shared}
            name="grantShares"
            label="Grant size"
            description="The total options or shares in the grant."
          />
          <ControlledNumberField
            {...shared}
            name="strikePrice"
            label="Strike price"
            description="What you pay to exercise one option."
            prefix="$"
            decimalScale={2}
          />
          <ControlledNumberField
            {...shared}
            name="totalCompanyShares"
            label="Fully diluted company shares"
          />
        </div>
      </div>

      <div className="assumption-section">
        <div className="assumption-section-heading">
          <p className="assumption-section-index">02</p>
          <h3>What happens next</h3>
        </div>
        <div className="field-list">
          <div className="company-value-group">
            <div className="company-value-grid">
              <ControlledMoneyField
                {...shared}
                name="currentCompanyValue"
                label="Company value today"
                externalDescribedBy="company-value-help"
              />
              <ControlledMoneyField
                {...shared}
                name="exitCompanyValue"
                label="Potential exit value"
                externalDescribedBy="company-value-help"
              />
            </div>
            <p id="company-value-help" className="company-value-help">
              Use full dollars or shorthand like 120m and 1.5b.
            </p>
          </div>
          <ControlledChoiceField
            {...shared}
            stableInput={stableInput}
            name="exitMonths"
            label="Time to exit"
            choices={EXIT_CHOICES}
            suffix=" months"
          />
          <Controller
            name="fundingRounds"
            control={form.control}
            render={({ field }) => (
              <StepperField
                id="fundingRounds"
                label="Future funding rounds"
                value={field.value}
                stableValue={stableInput.fundingRounds}
                min={0}
                max={10}
                step={1}
                error={getError(form, issues, "fundingRounds")}
                onChange={(value) => {
                  field.onChange(value);
                  onFieldChange("fundingRounds", value);
                }}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name="dilutionPerRound"
            control={form.control}
            render={({ field }) => (
              <SliderNumberField
                id="dilutionPerRound"
                label="Dilution per round"
                sliderLabel="Adjust dilution per round"
                value={field.value}
                stableValue={stableInput.dilutionPerRound}
                min={0}
                max={99.9}
                step={0.1}
                suffix="%"
                error={getError(form, issues, "dilutionPerRound")}
                onChange={(value) => {
                  field.onChange(value);
                  onFieldChange("dilutionPerRound", value);
                }}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>
      </div>

      <details className="advanced-assumptions">
        <summary>Vesting details</summary>
        <div className="field-list">
          <ControlledChoiceField
            {...shared}
            stableInput={stableInput}
            name="vestingMonths"
            label="Total vesting term"
            choices={VESTING_CHOICES}
            suffix=" months"
          />
          <ControlledChoiceField
            {...shared}
            stableInput={stableInput}
            name="cliffMonths"
            label="Vesting cliff"
            choices={CLIFF_CHOICES}
            suffix=" months"
          />
          {mode === "existing-equity" ? (
            <>
              <ControlledNumberField
                {...shared}
                name="vestedSharesToday"
                label="Vested shares today"
                description="Shares you could exercise right now."
              />
              <ControlledChoiceField
                {...shared}
                stableInput={stableInput}
                name="remainingVestingMonths"
                label="Remaining vesting"
                choices={REMAINING_VESTING_CHOICES}
                suffix=" months"
              />
            </>
          ) : null}
        </div>
      </details>
    </section>
  );
}
