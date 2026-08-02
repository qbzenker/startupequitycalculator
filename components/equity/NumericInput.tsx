"use client";

import { NumericFormat } from "react-number-format";

export interface NumericInputProps {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur: () => void;
  prefix?: string;
  suffix?: string;
  decimalScale?: number;
  describedBy?: string;
  invalid?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function NumericInput({
  id,
  value,
  onChange,
  onBlur,
  prefix,
  suffix,
  decimalScale = 0,
  describedBy,
  invalid = false,
  ariaLabel,
  className,
}: NumericInputProps) {
  return (
    <NumericFormat
      id={id}
      name={id}
      className={className}
      value={value ?? ""}
      onValueChange={({ floatValue }) => onChange(floatValue ?? null)}
      onBlur={onBlur}
      thousandSeparator
      allowNegative={false}
      decimalScale={decimalScale}
      inputMode={decimalScale > 0 ? "decimal" : "numeric"}
      prefix={prefix}
      suffix={suffix}
      aria-label={ariaLabel}
      aria-invalid={invalid ? "true" : "false"}
      aria-describedby={describedBy}
    />
  );
}
