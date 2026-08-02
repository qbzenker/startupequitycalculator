"use client";

import { FieldShell } from "./FieldShell";
import { NumericInput } from "./NumericInput";

interface StepperFieldProps {
  id: string;
  label: string;
  value: number | null;
  stableValue: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number | null) => void;
  onBlur: () => void;
  description?: string;
  error?: string;
}

export function StepperField({
  id,
  label,
  value,
  stableValue,
  min,
  max,
  step,
  onChange,
  onBlur,
  description,
  error,
}: StepperFieldProps) {
  const current = value ?? stableValue;
  const actionLabel = label.toLowerCase();

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      rich
    >
      {({ describedBy, invalid }) => (
        <div className="stepper-field">
          <button
            type="button"
            aria-label={`Decrease ${actionLabel}`}
            disabled={current <= min}
            onClick={() => onChange(Math.max(min, current - step))}
          >
            −
          </button>
          <NumericInput
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            describedBy={describedBy}
            invalid={invalid}
            className="stepper-value"
          />
          <button
            type="button"
            aria-label={`Increase ${actionLabel}`}
            disabled={current >= max}
            onClick={() => onChange(Math.min(max, current + step))}
          >
            +
          </button>
        </div>
      )}
    </FieldShell>
  );
}
