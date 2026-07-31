"use client";

import { NumericFormat } from "react-number-format";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur: () => void;
  description?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  decimalScale?: number;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  onBlur,
  description,
  error,
  prefix,
  suffix,
  decimalScale = 0,
}: NumberFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div className="field-group">
      <div className="field-copy">
        <label htmlFor={id}>{label}</label>
        {description ? (
          <p id={descriptionId} className="field-description">
            {description}
          </p>
        ) : null}
      </div>
      <div className="field-control">
        <NumericFormat
          id={id}
          value={value ?? ""}
          onValueChange={({ floatValue }) => onChange(floatValue ?? null)}
          onBlur={onBlur}
          thousandSeparator
          allowNegative={false}
          decimalScale={decimalScale}
          inputMode={decimalScale > 0 ? "decimal" : "numeric"}
          prefix={prefix}
          suffix={suffix}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy || undefined}
        />
        {error ? (
          <p id={errorId} className="field-error">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
