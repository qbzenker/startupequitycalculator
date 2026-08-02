"use client";

import { FieldShell } from "./FieldShell";
import { NumericInput } from "./NumericInput";

interface SliderNumberFieldProps {
  id: string;
  label: string;
  sliderLabel: string;
  value: number | null;
  stableValue: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number | null) => void;
  onBlur: () => void;
  description?: string;
  error?: string;
}

export function SliderNumberField({
  id,
  label,
  sliderLabel,
  value,
  stableValue,
  min,
  max,
  step,
  suffix,
  onChange,
  onBlur,
  description,
  error,
}: SliderNumberFieldProps) {
  const sliderValue = value ?? stableValue;

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      rich
    >
      {({ describedBy, invalid }) => (
        <div className="slider-number-field">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            aria-label={sliderLabel}
            aria-valuetext={`${sliderValue}${suffix}`}
            onChange={(event) => onChange(Number(event.currentTarget.value))}
          />
          <div className="slider-scale" aria-hidden="true">
            <span style={{ left: "0%" }}>0%</span>
            <span style={{ left: "20.02%" }}>20%</span>
            <span style={{ left: "40.04%" }}>40%</span>
            <span style={{ right: "0%" }}>99.9%</span>
          </div>
          <NumericInput
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            suffix={suffix}
            decimalScale={1}
            describedBy={describedBy}
            invalid={invalid}
            className="exact-value-input"
          />
        </div>
      )}
    </FieldShell>
  );
}
