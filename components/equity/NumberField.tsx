"use client";

import { FieldShell } from "./FieldShell";
import { NumericInput } from "./NumericInput";

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
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
    >
      {({ describedBy, invalid }) => (
        <NumericInput
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          prefix={prefix}
          suffix={suffix}
          decimalScale={decimalScale}
          describedBy={describedBy}
          invalid={invalid}
        />
      )}
    </FieldShell>
  );
}
