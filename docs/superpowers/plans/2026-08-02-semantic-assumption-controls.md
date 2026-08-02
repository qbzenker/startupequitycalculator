# Semantic Assumption Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat numeric assumptions form with precise, mobile-friendly controls selected by each assumption's semantics.

**Architecture:** React Hook Form remains the only scenario state owner. Focused field components share an accessible presentation shell and emit numeric values through the existing `onFieldChange` path; the Zod schema, calculation engine, presets, timeline, and comparison model remain unchanged. Incomplete exact drafts continue to use the hook's last valid scenario for projections and for the stable visual state of composite controls.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, React Hook Form 7, react-number-format 5, Zod 4, Vitest 4, Testing Library 16, native HTML range input, CSS

## Global Constraints

- Preserve arbitrary valid values such as a 43-month exit or 17.5% dilution.
- Keep React Hook Form as the single scenario state owner.
- Preserve the existing last-valid result and chart while an exact draft is incomplete or invalid.
- Do not alter equity calculations, preset values, timeline behavior, comparison behavior, or Zod validation bounds.
- Do not add an external component dependency.
- Keep exact contractual, cap-table, and share values as formatted numeric inputs.
- Support `m` and `b` currency shorthand while emitting base dollars.
- Use quick choices for common time horizons while keeping an exact month input visible.
- Use a whole-number stepper from 0 through 10 for future funding rounds.
- Use a dilution slider from 0 through 99.9 with 0.1-percentage-point steps and a paired exact input.
- Keep all interactive targets at least 44 CSS pixels in both dimensions where width applies.
- Work without horizontal page overflow at 320 CSS pixels.
- Preserve keyboard operation, visible focus, reduced-motion behavior, light/dark themes, and WCAG 2.2 AA contrast.
- Direct inputs show validation errors and are never silently clamped.
- Run lint, typecheck, all Vitest tests, a production build, and production-browser verification before completion.

## Target File Structure

```text
components/equity/
  AssumptionsPanel.tsx          # Equity-specific field mapping and groups
  EquityStudio.test.tsx         # Whole-studio semantic-control behavior
  EquityStudio.tsx              # Passes stable valid input to assumptions
  FieldShell.test.tsx           # Shared description and error wiring
  FieldShell.tsx                # Shared label, description, and error wiring
  MoneyField.test.tsx           # Currency shorthand component behavior
  MoneyField.tsx                # Exact currency draft and blur formatting
  NumberField.test.tsx          # Shared primitive and refactor regression tests
  NumberField.tsx               # Exact field composed from shared primitives
  NumericInput.tsx              # Unadorned NumericFormat control
  QuickChoiceField.test.tsx     # Common choice and custom exact behavior
  QuickChoiceField.tsx          # Pressed choices plus exact input
  SliderNumberField.test.tsx    # Range/exact synchronization
  SliderNumberField.tsx         # Native range plus exact input
  StepperField.test.tsx         # Discrete boundary and direct-entry behavior
  StepperField.tsx              # Decrease, exact value, increase
lib/equity/
  money.test.ts                 # Pure shorthand parsing cases
  money.ts                      # parseMoneyDraft()
app/
  globals.css                   # Field groups, controls, responsive layout
```

---

### Task 1: Shared Accessible Field Primitives

**Files:**
- Create: `components/equity/FieldShell.tsx`
- Create: `components/equity/FieldShell.test.tsx`
- Create: `components/equity/NumericInput.tsx`
- Create: `components/equity/NumberField.test.tsx`
- Modify: `components/equity/NumberField.tsx`

**Interfaces:**
- Produces: `FieldControlA11y`
- Produces: `FieldShell(props: FieldShellProps)`
- Produces: `NumericInput(props: NumericInputProps)`
- Preserves: `NumberField(props: NumberFieldProps)`

- [ ] **Step 1: Write the failing field-shell test**

Create `components/equity/FieldShell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FieldShell } from "./FieldShell";

describe("FieldShell", () => {
  it("provides shared description and error wiring to its control", () => {
    render(
      <FieldShell
        id="grantShares"
        label="Grant size"
        description="Copy this from the offer."
        error="Must be greater than zero"
      >
        {({ describedBy, invalid }) => (
          <input
            id="grantShares"
            aria-describedby={describedBy}
            aria-invalid={invalid}
          />
        )}
      </FieldShell>,
    );

    const input = screen.getByLabelText("Grant size");
    expect(input).toHaveAccessibleDescription(
      "Copy this from the offer. Must be greater than zero",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
```

- [ ] **Step 2: Run the field-shell test and verify RED**

Run:

```bash
bun run test:run -- components/equity/FieldShell.test.tsx
```

Expected: FAIL because `./FieldShell` does not exist.

- [ ] **Step 3: Write the `NumberField` characterization test**

Create `components/equity/NumberField.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NumberField } from "./NumberField";

describe("NumberField", () => {
  it("associates help and errors while emitting an exact number", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <NumberField
        id="grantShares"
        label="Grant size"
        description="Copy this from the offer."
        error="Must be greater than zero"
        value={20_000}
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Grant size");
    expect(input).toHaveAccessibleDescription(
      "Copy this from the offer. Must be greater than zero",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");

    await user.clear(input);
    await user.type(input, "25000");
    expect(onChange).toHaveBeenLastCalledWith(25_000);
  });
});
```

- [ ] **Step 4: Run the characterization test**

Run:

```bash
bun run test:run -- components/equity/NumberField.test.tsx
```

Expected: PASS against the current monolithic field, proving the behavior that
the refactor must preserve.

- [ ] **Step 5: Implement the shared field shell**

Create `components/equity/FieldShell.tsx`:

```tsx
import type { ReactNode } from "react";

export interface FieldControlA11y {
  describedBy: string | undefined;
  invalid: boolean;
}

interface FieldShellProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  rich?: boolean;
  children: (a11y: FieldControlA11y) => ReactNode;
}

export function FieldShell({
  id,
  label,
  description,
  error,
  rich = false,
  children,
}: FieldShellProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`field-group${rich ? " field-group-rich" : ""}`}>
      <div className="field-copy">
        <label htmlFor={id}>{label}</label>
        {description ? (
          <p id={descriptionId} className="field-description">
            {description}
          </p>
        ) : null}
      </div>
      <div className="field-control">
        {children({ describedBy, invalid: Boolean(error) })}
        {error ? (
          <p id={errorId} className="field-error">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Extract the reusable numeric input**

Create `components/equity/NumericInput.tsx`:

```tsx
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
```

- [ ] **Step 7: Refactor `NumberField` to compose the primitives**

Replace the presentation body in `components/equity/NumberField.tsx` with:

```tsx
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
```

- [ ] **Step 8: Run the focused and studio regression tests**

Run:

```bash
bun run test:run -- components/equity/FieldShell.test.tsx components/equity/NumberField.test.tsx components/equity/EquityStudio.test.tsx
```

Expected: PASS with the same accessible names and formatted values as before.

- [ ] **Step 9: Commit the primitive extraction**

```bash
git add components/equity/FieldShell.tsx components/equity/FieldShell.test.tsx components/equity/NumericInput.tsx components/equity/NumberField.tsx components/equity/NumberField.test.tsx
git commit -m "refactor: extract accessible field primitives"
```

---

### Task 2: Exact Currency Input With M/B Shorthand

**Files:**
- Create: `lib/equity/money.test.ts`
- Create: `lib/equity/money.ts`
- Create: `components/equity/MoneyField.test.tsx`
- Create: `components/equity/MoneyField.tsx`

**Interfaces:**
- Consumes: `FieldShell`, `formatCurrency`
- Produces: `parseMoneyDraft(draft: string): number | null`
- Produces: `MoneyField(props: MoneyFieldProps)`

- [ ] **Step 1: Write failing pure parser tests**

Create `lib/equity/money.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { parseMoneyDraft } from "./money";

describe("parseMoneyDraft", () => {
  it.each([
    ["120000000", 120_000_000],
    ["$120,000,000", 120_000_000],
    ["120m", 120_000_000],
    ["1.2B", 1_200_000_000],
    [" 1.5 b ", 1_500_000_000],
  ])("parses %s as base dollars", (draft, expected) => {
    expect(parseMoneyDraft(draft)).toBe(expected);
  });

  it.each(["", "$", "1.2t", "money", "-4m"])(
    "returns null for incomplete or unsupported input %s",
    (draft) => {
      expect(parseMoneyDraft(draft)).toBeNull();
    },
  );
});
```

- [ ] **Step 2: Run the parser tests and verify RED**

Run:

```bash
bun run test:run -- lib/equity/money.test.ts
```

Expected: FAIL because `./money` does not exist.

- [ ] **Step 3: Implement shorthand parsing**

Create `lib/equity/money.ts`:

```ts
const MONEY_MULTIPLIERS = {
  m: 1_000_000,
  b: 1_000_000_000,
} as const;

export function parseMoneyDraft(draft: string): number | null {
  const normalized = draft
    .trim()
    .toLowerCase()
    .replaceAll("$", "")
    .replaceAll(",", "")
    .replaceAll(" ", "");
  const match = normalized.match(/^(\d+(?:\.\d*)?|\.\d+)([mb])?$/);

  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const suffix = match[2] as keyof typeof MONEY_MULTIPLIERS | undefined;
  const value = amount * (suffix ? MONEY_MULTIPLIERS[suffix] : 1);

  return Number.isFinite(value) ? value : null;
}
```

- [ ] **Step 4: Run the parser tests and verify GREEN**

Run:

```bash
bun run test:run -- lib/equity/money.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write the failing `MoneyField` interaction test**

Create `components/equity/MoneyField.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MoneyField } from "./MoneyField";

describe("MoneyField", () => {
  it("accepts shorthand and formats base dollars on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBlur = vi.fn();

    render(
      <MoneyField
        id="exitCompanyValue"
        label="Potential exit value"
        value={1_500_000_000}
        onChange={onChange}
        onBlur={onBlur}
      />,
    );

    const input = screen.getByLabelText("Potential exit value");
    await user.clear(input);
    await user.type(input, "2.25b");
    expect(onChange).toHaveBeenLastCalledWith(2_250_000_000);

    await user.tab();
    expect(input).toHaveValue("$2,250,000,000");
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("associates validation feedback with the exact currency input", () => {
    render(
      <MoneyField
        id="currentCompanyValue"
        label="Company value today"
        value={0}
        error="Must be greater than zero"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Company value today");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Must be greater than zero");
  });
});
```

- [ ] **Step 6: Run the component test and verify RED**

Run:

```bash
bun run test:run -- components/equity/MoneyField.test.tsx
```

Expected: FAIL because `MoneyField` does not exist.

- [ ] **Step 7: Implement the money field**

Create `components/equity/MoneyField.tsx`:

```tsx
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
      inputRef.current.value =
        value === null ? "" : formatCurrency(value);
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
```

- [ ] **Step 8: Run the money tests and typecheck**

Run:

```bash
bun run test:run -- lib/equity/money.test.ts components/equity/MoneyField.test.tsx
bun run typecheck
```

Expected: all tests PASS and TypeScript reports no errors.

- [ ] **Step 9: Commit the currency field**

```bash
git add lib/equity/money.ts lib/equity/money.test.ts components/equity/MoneyField.tsx components/equity/MoneyField.test.tsx
git commit -m "feat: accept compact company values"
```

---

### Task 3: Common Time Choices With Exact Entry

**Files:**
- Create: `components/equity/QuickChoiceField.test.tsx`
- Create: `components/equity/QuickChoiceField.tsx`

**Interfaces:**
- Consumes: `FieldShell`, `NumericInput`
- Produces: `NumericChoice`
- Produces: `QuickChoiceField(props: QuickChoiceFieldProps)`

- [ ] **Step 1: Write the failing common-choice and custom-value tests**

Create `components/equity/QuickChoiceField.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QuickChoiceField } from "./QuickChoiceField";

const choices = [
  { label: "2 years", value: 24 },
  { label: "3 years", value: 36 },
  { label: "4 years", value: 48 },
  { label: "5 years", value: 60 },
];

describe("QuickChoiceField", () => {
  it("emits a quick choice and marks the matching value pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <QuickChoiceField
        id="exitMonths"
        label="Time to exit"
        value={48}
        stableValue={48}
        choices={choices}
        suffix=" months"
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    const group = screen.getByRole("group", {
      name: "Time to exit common values",
    });
    expect(
      within(group).getByRole("button", { name: "4 years" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(within(group).getByRole("button", { name: "3 years" }));
    expect(onChange).toHaveBeenLastCalledWith(36);
  });

  it("keeps an arbitrary exact value with no quick choice pressed", () => {
    render(
      <QuickChoiceField
        id="exitMonths"
        label="Time to exit"
        value={43}
        stableValue={43}
        choices={choices}
        suffix=" months"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Time to exit")).toHaveValue("43 months");
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("associates validation feedback with the exact value", () => {
    render(
      <QuickChoiceField
        id="exitMonths"
        label="Time to exit"
        value={null}
        stableValue={48}
        choices={choices}
        suffix=" months"
        error="Must be greater than zero"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Time to exit");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Must be greater than zero");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun run test:run -- components/equity/QuickChoiceField.test.tsx
```

Expected: FAIL because `QuickChoiceField` does not exist.

- [ ] **Step 3: Implement the quick-choice field**

Create `components/equity/QuickChoiceField.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
bun run test:run -- components/equity/QuickChoiceField.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the quick-choice field**

```bash
git add components/equity/QuickChoiceField.tsx components/equity/QuickChoiceField.test.tsx
git commit -m "feat: add exact time shortcuts"
```

---

### Task 4: Bounded Funding-Round Stepper

**Files:**
- Create: `components/equity/StepperField.test.tsx`
- Create: `components/equity/StepperField.tsx`

**Interfaces:**
- Consumes: `FieldShell`, `NumericInput`
- Produces: `StepperField(props: StepperFieldProps)`

- [ ] **Step 1: Write failing step and boundary tests**

Create `components/equity/StepperField.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StepperField } from "./StepperField";

describe("StepperField", () => {
  it("changes a discrete value by one in either direction", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <StepperField
        id="fundingRounds"
        label="Future funding rounds"
        value={2}
        stableValue={2}
        min={0}
        max={10}
        step={1}
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Increase future funding rounds",
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith(3);

    await user.click(
      screen.getByRole("button", {
        name: "Decrease future funding rounds",
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("disables the decrease action at zero", () => {
    render(
      <StepperField
        id="fundingRounds"
        label="Future funding rounds"
        value={0}
        stableValue={0}
        min={0}
        max={10}
        step={1}
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Decrease future funding rounds",
      }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Future funding rounds")).toHaveValue("0");
  });

  it("associates validation feedback with direct entry", () => {
    render(
      <StepperField
        id="fundingRounds"
        label="Future funding rounds"
        value={null}
        stableValue={2}
        min={0}
        max={10}
        step={1}
        error="Use a whole number of rounds"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Future funding rounds");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Use a whole number of rounds");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun run test:run -- components/equity/StepperField.test.tsx
```

Expected: FAIL because `StepperField` does not exist.

- [ ] **Step 3: Implement the bounded stepper**

Create `components/equity/StepperField.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
bun run test:run -- components/equity/StepperField.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the funding-round stepper**

```bash
git add components/equity/StepperField.tsx components/equity/StepperField.test.tsx
git commit -m "feat: add funding round stepper"
```

---

### Task 5: Dilution Slider With Exact Percentage

**Files:**
- Create: `components/equity/SliderNumberField.test.tsx`
- Create: `components/equity/SliderNumberField.tsx`

**Interfaces:**
- Consumes: `FieldShell`, `NumericInput`
- Produces: `SliderNumberField(props: SliderNumberFieldProps)`

- [ ] **Step 1: Write failing synchronization and native-semantics tests**

Create `components/equity/SliderNumberField.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SliderNumberField } from "./SliderNumberField";

describe("SliderNumberField", () => {
  it("synchronizes the range and exact percentage input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SliderNumberField
        id="dilutionPerRound"
        label="Dilution per round"
        sliderLabel="Adjust dilution per round"
        value={18}
        stableValue={18}
        min={0}
        max={99.9}
        step={0.1}
        suffix="%"
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    const slider = screen.getByRole("slider", {
      name: "Adjust dilution per round",
    });
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "99.9");
    expect(slider).toHaveAttribute("step", "0.1");
    expect(slider).toHaveAttribute("aria-valuetext", "18%");

    fireEvent.change(slider, { target: { value: "17.5" } });
    expect(onChange).toHaveBeenLastCalledWith(17.5);

    const exact = screen.getByLabelText("Dilution per round");
    await user.clear(exact);
    await user.type(exact, "19.3");
    expect(onChange).toHaveBeenLastCalledWith(19.3);
  });

  it("associates validation feedback with the exact percentage", () => {
    render(
      <SliderNumberField
        id="dilutionPerRound"
        label="Dilution per round"
        sliderLabel="Adjust dilution per round"
        value={null}
        stableValue={18}
        min={0}
        max={99.9}
        step={0.1}
        suffix="%"
        error="Dilution must be below 100%"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Dilution per round");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Dilution must be below 100%");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun run test:run -- components/equity/SliderNumberField.test.tsx
```

Expected: FAIL because `SliderNumberField` does not exist.

- [ ] **Step 3: Implement the native range and exact field**

Create `components/equity/SliderNumberField.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
bun run test:run -- components/equity/SliderNumberField.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the dilution field**

```bash
git add components/equity/SliderNumberField.tsx components/equity/SliderNumberField.test.tsx
git commit -m "feat: add exact dilution slider"
```

---

### Task 6: Integrate Semantic Controls Into the Assumptions Panel

**Files:**
- Create: `components/equity/AssumptionsPanel.test.tsx`
- Modify: `components/equity/AssumptionsPanel.tsx`
- Modify: `components/equity/EquityStudio.tsx`

**Interfaces:**
- Consumes: `EquityScenarioFormValues`, `EquityScenarioInput`
- Consumes: `MoneyField`, `NumberField`, `QuickChoiceField`, `StepperField`, `SliderNumberField`
- Adds: `stableInput: EquityScenarioInput` to `AssumptionsPanelProps`
- Preserves: `onFieldChange(name, value)` as the only last-valid update path

- [ ] **Step 1: Write the failing panel mapping test**

Create `components/equity/AssumptionsPanel.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EquityStudio } from "./EquityStudio";

describe("AssumptionsPanel", () => {
  it("maps each assumption to its semantic control", () => {
    render(<EquityStudio />);

    expect(
      screen.getByRole("heading", { name: "Your grant" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What happens next" }),
    ).toBeInTheDocument();

    const exitChoices = screen.getByRole("group", {
      name: "Time to exit common values",
    });
    expect(
      within(exitChoices).getByRole("button", { name: "4 years" }),
    ).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByRole("button", {
        name: "Decrease future funding rounds",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Increase future funding rounds",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", {
        name: "Adjust dilution per round",
      }),
    ).toHaveValue("18");
  });
});
```

Append these interaction tests to `components/equity/EquityStudio.test.tsx`:

```tsx
it("accepts an exact custom horizon and dilution", async () => {
  const user = userEvent.setup();
  render(<EquityStudio />);

  const exitMonths = screen.getByLabelText("Time to exit");
  await user.clear(exitMonths);
  await user.type(exitMonths, "43");

  const dilution = screen.getByLabelText("Dilution per round");
  await user.clear(dilution);
  await user.type(dilution, "17.5");

  expect(exitMonths).toHaveValue("43 months");
  expect(dilution).toHaveValue("17.5%");
  expect(
    screen.getByRole("button", { name: "Custom scenario" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.queryByText("Results use your last valid assumptions."),
  ).not.toBeInTheDocument();
});

it("parses company value shorthand into the active scenario", async () => {
  const user = userEvent.setup();
  render(<EquityStudio />);

  const exitValue = screen.getByLabelText("Potential exit value");
  await user.clear(exitValue);
  await user.type(exitValue, "2b");
  await user.tab();

  expect(exitValue).toHaveValue("$2,000,000,000");
  expect(
    screen.getByRole("button", { name: "Custom scenario" }),
  ).toHaveAttribute("aria-pressed", "true");
});

it("synchronizes semantic controls when reset restores Series A", async () => {
  const user = userEvent.setup();
  render(<EquityStudio />);

  await user.click(
    screen.getByRole("button", {
      name: "Increase future funding rounds",
    }),
  );
  await user.click(screen.getByRole("button", { name: "Reset" }));

  expect(screen.getByLabelText("Future funding rounds")).toHaveValue("2");
  expect(
    screen.getByRole("slider", {
      name: "Adjust dilution per round",
    }),
  ).toHaveValue("18");
  expect(
    within(
      screen.getByRole("group", {
        name: "Time to exit common values",
      }),
    ).getByRole("button", { name: "4 years" }),
  ).toHaveAttribute("aria-pressed", "true");
});

it("shows existing-equity vesting controls in the details section", async () => {
  const user = userEvent.setup();
  render(<EquityStudio />);

  await user.click(
    screen.getByRole("button", { name: "Existing equity" }),
  );
  await user.click(screen.getByText("Vesting details"));

  expect(screen.getByLabelText("Vested shares today")).toHaveValue("0");
  expect(
    screen.getByRole("group", {
      name: "Remaining vesting common values",
    }),
  ).toBeInTheDocument();
});

it("restores every semantic representation when loading a snapshot", async () => {
  const user = userEvent.setup();
  render(<EquityStudio />);

  await user.click(
    screen.getByRole("button", { name: "Compare this scenario" }),
  );
  await user.click(
    screen.getByRole("button", {
      name: "Increase future funding rounds",
    }),
  );
  await user.click(
    screen.getByRole("button", { name: "Load Baseline" }),
  );

  expect(screen.getByLabelText("Future funding rounds")).toHaveValue("2");
  expect(
    screen.getByRole("slider", {
      name: "Adjust dilution per round",
    }),
  ).toHaveValue("18");
  expect(
    within(
      screen.getByRole("group", {
        name: "Time to exit common values",
      }),
    ).getByRole("button", { name: "4 years" }),
  ).toHaveAttribute("aria-pressed", "true");
});
```

- [ ] **Step 2: Run the panel and studio tests and verify RED**

Run:

```bash
bun run test:run -- components/equity/AssumptionsPanel.test.tsx components/equity/EquityStudio.test.tsx
```

Expected: FAIL because the section headings, semantic controls, and currency
shorthand integration do not exist.

- [ ] **Step 3: Add stable valid input to the panel boundary**

In `components/equity/EquityStudio.tsx`, pass:

```tsx
<AssumptionsPanel
  form={studio.form}
  stableInput={studio.validInput}
  issues={studio.issues}
  onReset={studio.resetScenario}
  onFieldChange={studio.updateLastValidField}
/>
```

In `components/equity/AssumptionsPanel.tsx`, add:

```ts
import type { EquityScenarioInput } from "@/lib/equity/types";

interface AssumptionsPanelProps {
  form: UseFormReturn<EquityScenarioFormValues>;
  stableInput: EquityScenarioInput;
  issues: Map<string, string>;
  onReset: () => void;
  onFieldChange: (name: NumericFieldName, value: number | null) => void;
}
```

- [ ] **Step 4: Replace the flat panel with the complete semantic mapping**

Replace `components/equity/AssumptionsPanel.tsx` with:

```tsx
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

function getError(
  form: UseFormReturn<EquityScenarioFormValues>,
  issues: Map<string, string>,
  name: NumericFieldName,
) {
  return form.formState.touchedFields[name] ? issues.get(name) : undefined;
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
          <ControlledMoneyField
            {...shared}
            name="currentCompanyValue"
            label="Company value today"
            description="Enter full dollars or shorthand such as 120m."
          />
          <ControlledMoneyField
            {...shared}
            name="exitCompanyValue"
            label="Potential exit value"
            description="Enter full dollars or shorthand such as 1.5b."
          />
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
```

- [ ] **Step 5: Run the panel and studio tests**

Run:

```bash
bun run test:run -- components/equity/AssumptionsPanel.test.tsx components/equity/EquityStudio.test.tsx
```

Expected: the new panel test passes and all existing studio behaviors remain
green. Update existing funding-round test interactions to use the exact input
with label `Future funding rounds`; do not query stepper buttons when the test
is specifically exercising direct entry.

- [ ] **Step 6: Commit the panel integration**

```bash
git add components/equity/AssumptionsPanel.tsx components/equity/AssumptionsPanel.test.tsx components/equity/EquityStudio.tsx components/equity/EquityStudio.test.tsx
git commit -m "feat: map assumptions to semantic controls"
```

---

### Task 7: Responsive Styling and Full Verification

**Files:**
- Modify: `app/globals.css`
- Modify: `README.md`

**Interfaces:**
- Consumes: all semantic field components through `EquityStudio`
- Produces: responsive, keyboard-visible, theme-aware semantic-control styling
- Documents: shorthand and direct-manipulation input behavior

- [ ] **Step 1: Capture the unstyled browser baseline**

Run the development server:

```bash
bun run dev -- --hostname 127.0.0.1 --port 3100
```

Using the Playwright skill at 390 × 844, inspect the new semantic controls
before adding their CSS. Expected RED evidence:

- quick-choice buttons do not yet meet the 44 CSS-pixel target;
- the stepper does not yet read as one connected control;
- the dilution range inherits text-input border and background styles;
- rich controls do not yet have a deliberate stacked mobile layout.

Stop the development server after recording those four observations.

- [ ] **Step 2: Add the semantic control visual system**

In `app/globals.css`, add the following rules after the existing field styles:

```css
.assumption-section + .assumption-section {
  margin-top: 28px;
}

.assumption-section-heading {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px solid var(--border-strong);
}

.assumption-section-heading h3,
.assumption-section-index {
  margin: 0;
}

.assumption-section-heading h3 {
  font-family: var(--font-newsreader), Georgia, serif;
  font-size: 19px;
  font-weight: 600;
}

.assumption-section-index {
  color: var(--green);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.field-group-rich {
  grid-template-columns: 1fr;
  align-items: start;
}

.choice-field,
.slider-number-field {
  display: grid;
  gap: 10px;
}

.quick-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.quick-choices button {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--ink-soft);
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
}

.quick-choices button[aria-pressed="true"] {
  border-color: var(--green);
  background: var(--green);
  color: var(--surface);
}

.exact-value-input {
  max-width: 180px;
  margin-left: auto;
}

.stepper-field {
  display: grid;
  grid-template-columns: 44px minmax(88px, 1fr) 44px;
  gap: 7px;
}

.stepper-field button {
  width: 44px;
  min-height: 44px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-muted);
  color: var(--green);
  cursor: pointer;
  font-size: 19px;
}

.stepper-field button:disabled {
  color: var(--ink-faint);
  cursor: not-allowed;
  opacity: 0.6;
}

.stepper-value {
  text-align: center;
}

.slider-number-field input[type="range"] {
  width: 100%;
  min-height: 44px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  accent-color: var(--green);
  cursor: pointer;
}

.slider-scale {
  position: relative;
  height: 12px;
  color: var(--ink-faint);
  font-size: 9px;
  font-variant-numeric: tabular-nums;
}

.slider-scale span {
  position: absolute;
  transform: translateX(-50%);
}

.slider-scale span:first-child {
  transform: none;
}

.slider-scale span:last-child {
  transform: none;
}

@media (max-width: 700px) {
  .field-group,
  .field-group-rich {
    grid-template-columns: 1fr;
    gap: 9px;
  }

  .field-control input {
    text-align: left;
  }

  .exact-value-input {
    width: 100%;
    max-width: none;
    margin-left: 0;
  }

  .quick-choices button {
    flex: 1 1 calc(50% - 7px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .quick-choices button,
  .stepper-field button {
    transition-duration: 0.01ms;
  }
}
```

- [ ] **Step 3: Document the input ergonomics**

Add this bullet under `What it models` in `README.md`:

```markdown
- **Fast, exact assumptions.** Common time horizons are one tap away, funding
  rounds use a bounded stepper, dilution is directly explorable, and company
  values accept full dollars or shorthand such as `120m` and `1.5b`.
```

- [ ] **Step 4: Run the focused semantic-control test suite**

Run:

```bash
bun run test:run -- components/equity/FieldShell.test.tsx components/equity/NumberField.test.tsx components/equity/MoneyField.test.tsx components/equity/QuickChoiceField.test.tsx components/equity/StepperField.test.tsx components/equity/SliderNumberField.test.tsx components/equity/AssumptionsPanel.test.tsx components/equity/EquityStudio.test.tsx lib/equity/money.test.ts
```

Expected: PASS with no console warnings.

- [ ] **Step 5: Run the complete automated gate**

Run:

```bash
bun run check
```

Expected:

- ESLint passes;
- TypeScript passes;
- every Vitest file passes;
- the Next.js production build succeeds;
- the `/` route remains statically generated.

- [ ] **Step 6: Run production-browser verification**

Start the built app:

```bash
bun run start -- --hostname 127.0.0.1 --port 3100
```

Using the Playwright skill, verify:

1. At 320 × 800 and 390 × 844, `document.documentElement.scrollWidth` equals
   `window.innerWidth`.
2. Quick choices wrap within the assumptions panel.
3. Every quick choice and stepper button measures at least 44 CSS pixels high;
   stepper buttons also measure at least 44 CSS pixels wide.
4. The dilution slider changes with pointer input and ArrowLeft/ArrowRight.
5. The exact dilution field accepts 17.5 and remains synchronized.
6. Time to exit accepts 43 months with no shortcut pressed.
7. `2b` formats as `$2,000,000,000` on blur.
8. Tab order reaches choices, exact inputs, stepper controls, and slider in
   logical reading order with visible focus.
9. Light and dark themes preserve readable borders, text, pressed states, and
   focus indicators.
10. With reduced motion emulated, semantic-control transitions compute to a
    near-zero duration.
11. The browser console contains zero warnings and errors.
12. All static network requests return successful responses.

Repeat layout inspection at 768 × 1024 and 1440 × 1000.

- [ ] **Step 7: Commit the responsive integration**

```bash
git add app/globals.css README.md
git commit -m "feat: polish semantic controls across breakpoints"
```

- [ ] **Step 8: Verify the exact commit and update the existing PR**

Run:

```bash
bun run check
git status -sb
git log -1 --oneline
git push
gh pr view 2 --json url,isDraft,state,baseRefName,headRefName,statusCheckRollup
```

Expected:

- the full gate passes on the commit being pushed;
- the worktree is clean;
- local `HEAD` matches `origin/codex/equity-scenario-studio`;
- PR #2 remains open as a draft against `main`;
- new remote checks begin or complete successfully.
