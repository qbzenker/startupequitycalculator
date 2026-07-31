"use client";

import type { EquityMode } from "@/lib/equity/types";

interface ModeSwitchProps {
  value: EquityMode;
  onChange: (mode: EquityMode) => void;
}

const MODES = [
  { value: "new-offer", label: "New offer" },
  { value: "existing-equity", label: "Existing equity" },
] as const;

export function ModeSwitch({ value, onChange }: ModeSwitchProps) {
  return (
    <div className="mode-switch" role="group" aria-label="Equity workflow">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          aria-pressed={value === mode.value}
          onClick={() => onChange(mode.value)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
