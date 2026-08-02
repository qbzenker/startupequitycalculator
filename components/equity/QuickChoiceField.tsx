"use client";

import { FieldShell } from "./FieldShell";
import { NumericInput } from "./NumericInput";

export interface NumericChoice {
  label: string;
  value: number;
}

interface QuickChoiceFieldProps {
  id: string;
  label: string;
  value: number | null;
  stableValue: number;
  choices: readonly NumericChoice[];
  onChange: (value: number | null) => void;
  onBlur: () => void;
  description?: string;
  error?: string;
  suffix?: string;
}

export function QuickChoiceField({
  id,
  label,
  value,
  stableValue,
  choices,
  onChange,
  onBlur,
  description,
  error,
  suffix,
}: QuickChoiceFieldProps) {
  const selectedValue = value ?? stableValue;

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      rich
    >
      {({ describedBy, invalid }) => (
        <div className="choice-field">
          <div
            className="quick-choices"
            role="group"
            aria-label={`${label} common values`}
          >
            {choices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                aria-pressed={selectedValue === choice.value}
                onClick={() => onChange(choice.value)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <NumericInput
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            suffix={suffix}
            describedBy={describedBy}
            invalid={invalid}
            className="exact-value-input"
          />
        </div>
      )}
    </FieldShell>
  );
}
