"use client";

import { useEffect, useRef } from "react";

import { formatCurrency } from "@/lib/equity/format";
import { parseMoneyDraft } from "@/lib/equity/money";

import { FieldShell } from "./FieldShell";

interface MoneyFieldProps {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur: () => void;
  description?: string;
  error?: string;
}

export function MoneyField({
  id,
  label,
  value,
  onChange,
  onBlur,
  description,
  error,
}: MoneyFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current && inputRef.current) {
      inputRef.current.value = value === null ? "" : formatCurrency(value);
    }
  }, [value]);

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
    >
      {({ describedBy, invalid }) => (
        <input
          ref={inputRef}
          id={id}
          name={id}
          defaultValue={value === null ? "" : formatCurrency(value)}
          inputMode="decimal"
          aria-invalid={invalid ? "true" : "false"}
          aria-describedby={describedBy}
          onFocus={() => {
            editing.current = true;
          }}
          onChange={(event) => {
            const nextDraft = event.currentTarget.value;
            onChange(parseMoneyDraft(nextDraft));
          }}
          onBlur={(event) => {
            editing.current = false;
            const parsed = parseMoneyDraft(event.currentTarget.value);
            if (parsed !== null) {
              event.currentTarget.value = formatCurrency(parsed);
            }
            onBlur();
          }}
        />
      )}
    </FieldShell>
  );
}
