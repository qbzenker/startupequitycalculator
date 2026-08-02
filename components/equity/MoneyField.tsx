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
  const lastEmittedValue = useRef<number | null>(value);
  const pendingExternalValue = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (editing.current) {
      if (value !== lastEmittedValue.current) {
        pendingExternalValue.current = value;
      }
      return;
    }

    pendingExternalValue.current = undefined;
    lastEmittedValue.current = value;
    inputRef.current.value = value === null ? "" : formatCurrency(value);
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
            const parsed = parseMoneyDraft(nextDraft);
            lastEmittedValue.current = parsed;
            onChange(parsed);
          }}
          onBlur={(event) => {
            editing.current = false;
            const externalValue = pendingExternalValue.current;
            pendingExternalValue.current = undefined;

            if (externalValue !== undefined) {
              lastEmittedValue.current = externalValue;
              event.currentTarget.value =
                externalValue === null ? "" : formatCurrency(externalValue);
            } else {
              const parsed = parseMoneyDraft(event.currentTarget.value);
              if (parsed !== null) {
                event.currentTarget.value = formatCurrency(parsed);
              }
            }
            onBlur();
          }}
        />
      )}
    </FieldShell>
  );
}
