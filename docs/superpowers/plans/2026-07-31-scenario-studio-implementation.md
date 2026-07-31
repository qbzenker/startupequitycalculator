# Startup Equity Scenario Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current form-heavy calculator with a mobile-first, tested scenario studio that models vesting, dilution, exercise cost, value over time, and three-scenario comparisons.

**Architecture:** Pure TypeScript modules own validation, presets, calculations, timeline generation, formatting, and comparison behavior. A client-side React studio consumes those modules through focused components; the App Router page remains a server component shell. All displayed results and chart points come from the same validated numeric scenario.

**Tech Stack:** Next.js 16.2.12, React 19.2.8, TypeScript 6.0.3, Tailwind CSS 4.3.3, Zod 4.4.3, React Hook Form 7.83.0, Recharts 3.10.1, Vitest 4.1.10, Testing Library 16.3.2, Bun 1.3.x

## Global Constraints

- Support both `new-offer` and `existing-equity`; default to `new-offer`.
- Use `Series A · typical` as the default preset.
- Show results before the full form on mobile.
- Allow the editable active scenario plus two saved snapshots; never more than three visible scenarios total.
- All values are pre-tax estimates and exclude liquidation preferences.
- Never display `NaN`, `Infinity`, or a broken chart.
- Work without horizontal page scrolling at 320, 375, 390, 768, 1024, and 1440 CSS pixels.
- Meet WCAG 2.2 AA contrast and interaction expectations.
- Preserve light/dark theme support and honor `prefers-reduced-motion`.
- Use Bun as the canonical package manager and regenerate `bun.lock`.
- Upgrade every direct dependency to its latest mutually compatible stable release available on July 31, 2026; document any exception with its exact reason.
- Use the approved light palette: `#F4F1E8`, `#FFFDF8`, `#18251E`, `#1F7A52`, `#DCECDF`, `#DF7253`, and `#D5A538`.

## Target File Structure

```text
app/
  globals.css                   # Tailwind import, design tokens, global motion/focus rules
  layout.tsx                    # Metadata, next/font, theme provider
  page.tsx                      # Server shell for the scenario studio
components/
  BrandMark.tsx                 # Compact product mark
  Footer.tsx                    # Compact methodology/repository footer
  ThemeProvider.tsx             # Existing next-themes provider
  equity/
    AssumptionsPanel.tsx        # Essential and advanced inputs
    ComparisonTray.tsx          # Saved-scenario controls and comparison table
    EquityStudio.tsx            # Client orchestrator and last-valid behavior
    EquityTimeline.tsx          # Recharts visualization and accessible summary
    Methodology.tsx             # Explicit model boundaries
    ModeSwitch.tsx              # New/existing workflow switch
    NumberField.tsx             # Shared accessible numeric field
    ResultSummary.tsx           # Headline value and supporting metrics
    ScenarioChips.tsx           # Preset selection and custom state
    StudioHeader.tsx            # Wordmark, mode, theme control
    useEquityStudio.ts          # Form, preset, and comparison coordination
lib/
  equity/
    calculate.ts                # Pure current/exit calculation
    calculate.test.ts
    comparisons.ts              # Pure snapshot operations
    comparisons.test.ts
    format.ts                   # Display formatting only
    format.test.ts
    presets.ts                  # Immutable preset catalog and matching
    presets.test.ts
    schema.ts                   # Zod validation and draft normalization
    schema.test.ts
    timeline.ts                 # Quarterly points and event markers
    timeline.test.ts
    types.ts                    # Shared domain types
vitest.config.ts
vitest.setup.ts
```

The following current files become obsolete and are deleted after replacements are in place:

```text
components/EquityCalculator.tsx
components/HomePage.tsx
components/Logo.tsx
components/RandomTagline.tsx
components/ResultsDisplay.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/divider.tsx
components/ui/dropdown-menu.tsx
components/ui/input.tsx
components/ui/slider.tsx
components/ui/toggle-group.tsx
components/ui/toggle.tsx
components/ui/theme-switcher.tsx
tailwind.config.ts
utils/calculations.ts
```

---

### Task 1: Modern Toolchain and Domain Foundations

**Files:**
- Modify: `package.json`
- Modify: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/equity/types.ts`
- Create: `lib/equity/format.test.ts`
- Create: `lib/equity/format.ts`
- Modify: `bun.lock` through `bun install`

**Interfaces:**
- Produces: `EquityMode`, `EquityScenarioInput`, `EquityResult`, `TimelinePoint`, `TimelineEvent`, `ScenarioPreset`, `SavedScenario`
- Produces: `formatCurrency(value)`, `formatCompactCurrency(value)`, `formatShares(value)`, `formatOwnership(value)`

- [ ] **Step 1: Replace the package targets and scripts**

Update the `scripts`, `dependencies`, and `devDependencies` sections of `package.json` to these direct targets while preserving the existing package name, version, and `private` fields. Keep the upgraded Radix, CVA, and `tailwindcss-animate` packages temporarily so the legacy UI continues compiling until Task 9 removes its dead components:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "check": "bun run lint && bun run typecheck && bun run test:run && bun run build"
  },
  "dependencies": {
    "@hookform/resolvers": "5.5.7",
    "@radix-ui/react-dropdown-menu": "2.1.24",
    "@radix-ui/react-slider": "1.4.7",
    "@radix-ui/react-slot": "1.3.3",
    "@radix-ui/react-toggle": "1.1.18",
    "@radix-ui/react-toggle-group": "1.1.19",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "lucide-react": "1.28.0",
    "next": "16.2.12",
    "next-themes": "0.4.6",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "react-hook-form": "7.83.0",
    "react-is": "19.2.8",
    "react-number-format": "5.4.5",
    "recharts": "3.10.1",
    "tailwind-merge": "3.6.0",
    "tailwindcss-animate": "1.0.7",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.3.3",
    "@testing-library/jest-dom": "7.0.0",
    "@testing-library/react": "16.3.2",
    "@testing-library/user-event": "14.6.1",
    "@types/node": "26.1.2",
    "@types/react": "19.2.18",
    "@types/react-dom": "19.2.4",
    "@types/react-is": "19.2.0",
    "eslint": "9.39.5",
    "eslint-config-next": "16.2.12",
    "jsdom": "30.0.1",
    "tailwindcss": "4.3.3",
    "typescript": "6.0.3",
    "vitest": "4.1.10"
  }
}
```

- [ ] **Step 2: Install with Bun and inspect compatibility**

Run:

```bash
bun install
bun pm ls
```

Expected: installation succeeds, `bun.lock` changes, and no unresolved peer dependency appears. If a listed exact target is incompatible, record the command output and use the newest compatible release rather than forcing installation.

- [ ] **Step 3: Replace the ESLint compatibility layer with the Next 16 flat config**

Use:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".superpowers/**",
    ".playwright-cli/**",
    "output/**"
  ])
]);
```

- [ ] **Step 4: Add the Vitest environment**

`vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
  },
});
```

`vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Define the shared domain types**

`lib/equity/types.ts` must include:

```ts
export type EquityMode = "new-offer" | "existing-equity";

export interface EquityScenarioInput {
  mode: EquityMode;
  grantShares: number;
  strikePrice: number;
  totalCompanyShares: number;
  currentCompanyValue: number;
  exitCompanyValue: number;
  exitMonths: number;
  fundingRounds: number;
  dilutionPerRound: number;
  vestingMonths: number;
  cliffMonths: number;
  vestedSharesToday: number;
  remainingVestingMonths: number;
}

export interface EquityResult {
  vestedSharesToday: number;
  vestedSharesAtExit: number;
  currentOwnership: number;
  ownershipAtExit: number;
  currentGrossValue: number;
  currentExerciseCost: number;
  currentNetValue: number;
  exitGrossValue: number;
  exitExerciseCost: number;
  exitNetValue: number;
  dilutionFactorAtExit: number;
}

export type TimelineEventKind = "cliff" | "funding" | "fully-vested" | "exit";

export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  month: number;
  label: string;
}

export interface TimelinePoint {
  month: number;
  companyValue: number;
  vestedShares: number;
  completedRounds: number;
  ownership: number;
  grossValue: number;
  exerciseCost: number;
  netValue: number;
}

export interface ScenarioPreset {
  id: "early-employee" | "series-a" | "growth-stage" | "conservative";
  label: string;
  description: string;
  input: EquityScenarioInput;
}

export interface SavedScenario {
  id: string;
  name: string;
  color: string;
  input: EquityScenarioInput;
  result: EquityResult;
  timeline: TimelinePoint[];
}
```

- [ ] **Step 6: Write failing formatter tests**

`lib/equity/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  formatCompactCurrency,
  formatCurrency,
  formatOwnership,
  formatShares,
} from "./format";

describe("equity formatters", () => {
  it("formats positive and negative whole-dollar values", () => {
    expect(formatCurrency(2361176)).toBe("$2,361,176");
    expect(formatCurrency(-1250)).toBe("-$1,250");
  });

  it("uses compact suffixes without hiding meaningful precision", () => {
    expect(formatCompactCurrency(2361176)).toBe("$2.36M");
    expect(formatCompactCurrency(111647)).toBe("$111.6K");
  });

  it("formats shares and fractional ownership", () => {
    expect(formatShares(20000)).toBe("20,000");
    expect(formatOwnership(0.00079)).toBe("0.079%");
  });
});
```

- [ ] **Step 7: Run the formatter test and verify RED**

Run:

```bash
bun run test:run lib/equity/format.test.ts
```

Expected: FAIL because `lib/equity/format.ts` does not exist.

- [ ] **Step 8: Implement the formatters**

Implement `format.ts` with `Intl.NumberFormat`. `formatOwnership` accepts a decimal fraction (`0.00079`) rather than percentage points.

- [ ] **Step 9: Verify GREEN and commit**

Run:

```bash
bun run test:run lib/equity/format.test.ts
bun run typecheck
git add package.json bun.lock eslint.config.mjs vitest.config.ts vitest.setup.ts lib/equity
git commit -m "chore: modernize toolchain and add equity domain"
```

Expected: formatter tests and typecheck pass.

---

### Task 2: Scenario Validation and Presets

**Files:**
- Create: `lib/equity/schema.test.ts`
- Create: `lib/equity/schema.ts`
- Create: `lib/equity/presets.test.ts`
- Create: `lib/equity/presets.ts`

**Interfaces:**
- Consumes: `EquityScenarioInput`, `EquityMode`, `ScenarioPreset`
- Produces: `equityScenarioSchema`, `parseScenario(input)`, `PRESETS`, `DEFAULT_PRESET`, `findMatchingPreset(input)`, `changeScenarioMode(input, mode)`

- [ ] **Step 1: Write failing schema boundary tests**

Cover positive company values, a whole-number funding-round limit of `0..10`, `0 <= dilution < 100`, cliff not exceeding vesting, vested shares not exceeding the grant, and a maximum exit of 180 months.

```ts
it("rejects vested shares above the grant", () => {
  const parsed = equityScenarioSchema.safeParse({
    ...VALID_SCENARIO,
    mode: "existing-equity",
    vestedSharesToday: VALID_SCENARIO.grantShares + 1,
  });
  expect(parsed.success).toBe(false);
});
```

Define `VALID_SCENARIO` in the test file with the exact Series A input values from the approved spec so schema tests do not depend on the preset module they precede.

- [ ] **Step 2: Verify schema tests fail**

Run:

```bash
bun run test:run lib/equity/schema.test.ts
```

Expected: FAIL because schema exports do not exist.

- [ ] **Step 3: Implement Zod 4 validation**

Use `z.object` and `.superRefine` for cross-field rules. Export `type EquityScenarioDraft = z.input<typeof equityScenarioSchema>` for form integration.

- [ ] **Step 4: Verify schema tests pass**

Run:

```bash
bun run test:run lib/equity/schema.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write failing preset tests**

Tests must assert the exact four approved presets, Series A as default, exact-value matching, `Custom` behavior after any changed value, and mode conversion:

```ts
it("preserves compatible values when switching to existing equity", () => {
  const changed = changeScenarioMode(DEFAULT_PRESET.input, "existing-equity");
  expect(changed.mode).toBe("existing-equity");
  expect(changed.grantShares).toBe(DEFAULT_PRESET.input.grantShares);
  expect(changed.vestedSharesToday).toBe(0);
  expect(changed.remainingVestingMonths).toBe(48);
});
```

- [ ] **Step 6: Verify preset tests fail**

Run:

```bash
bun run test:run lib/equity/presets.test.ts
```

Expected: FAIL because preset exports do not exist.

- [ ] **Step 7: Implement immutable presets and exact matching**

Use `satisfies readonly ScenarioPreset[]`, clone preset inputs before returning them, and compare every `EquityScenarioInput` field in `findMatchingPreset`.

- [ ] **Step 8: Verify and commit**

Run:

```bash
bun run test:run lib/equity/schema.test.ts lib/equity/presets.test.ts
git add lib/equity/schema.ts lib/equity/schema.test.ts lib/equity/presets.ts lib/equity/presets.test.ts
git commit -m "feat: add validated equity scenario presets"
```

Expected: both suites pass.

---

### Task 3: Calculation Engine

**Files:**
- Create: `lib/equity/calculate.test.ts`
- Create: `lib/equity/calculate.ts`

**Interfaces:**
- Consumes: validated `EquityScenarioInput`
- Produces: `getVestedSharesAtMonth(input, month): number`
- Produces: `getCompletedRoundsAtMonth(input, month): number`
- Produces: `getDilutionFactor(input, completedRounds): number`
- Produces: `calculateEquity(input): EquityResult`

- [ ] **Step 1: Write failing vesting tests**

Include new-offer months `11`, `12`, `15`, and `48`; existing-equity month `0`, midpoint, and completion; exit before full vesting; and cap-at-grant behavior.

```ts
it("vests the proportional cliff amount at month 12", () => {
  expect(getVestedSharesAtMonth(DEFAULT_PRESET.input, 11)).toBe(0);
  expect(getVestedSharesAtMonth(DEFAULT_PRESET.input, 12)).toBe(5000);
});
```

- [ ] **Step 2: Verify vesting tests fail**

Run:

```bash
bun run test:run lib/equity/calculate.test.ts
```

Expected: FAIL because calculation exports do not exist.

- [ ] **Step 3: Implement vesting helpers**

New-offer vesting uses:

```text
month < cliffMonths  => 0
otherwise           => grantShares × min(month / vestingMonths, 1)
```

Existing-equity vesting uses:

```text
vestedSharesToday +
  (grantShares - vestedSharesToday) × min(month / remainingVestingMonths, 1)
```

Handle `remainingVestingMonths === 0` as fully vested.

- [ ] **Step 4: Verify vesting tests pass**

Run the focused suite and confirm green.

- [ ] **Step 5: Add failing ownership, dilution, and value tests**

Cover:

- no future rounds;
- two rounds at 18%;
- current ownership;
- exit ownership;
- current and exit exercise cost;
- exits before full vesting;
- negative net value;
- pre-tax net value arithmetic.

Use explicit arithmetic assertions with `toBeCloseTo`, not formatted strings.

- [ ] **Step 6: Verify the new tests fail for missing behavior**

Expected: vesting tests remain green; result assertions fail.

- [ ] **Step 7: Implement `calculateEquity`**

Calculate current value from today’s vested shares and current value with no future dilution. Calculate exit value from shares vested by `exitMonths`, exit company value, and all modeled future rounds.

- [ ] **Step 8: Verify and commit**

Run:

```bash
bun run test:run lib/equity/calculate.test.ts
bun run typecheck
git add lib/equity/calculate.ts lib/equity/calculate.test.ts
git commit -m "feat: calculate vesting dilution and equity value"
```

Expected: all calculation tests pass.

---

### Task 4: Quarterly Timeline and Events

**Files:**
- Create: `lib/equity/timeline.test.ts`
- Create: `lib/equity/timeline.ts`

**Interfaces:**
- Consumes: validated `EquityScenarioInput`
- Produces: `getFundingRoundMonths(input): number[]`
- Produces: `generateTimeline(input): { points: TimelinePoint[]; events: TimelineEvent[] }`

- [ ] **Step 1: Write failing event-placement tests**

For a 48-month exit and two rounds, assert round months `16` and `32`. Assert cliff at `12`, full vest at `48`, and exit at `48`. Deduplicate labels when full vest and exit share a month without losing either semantic event.

- [ ] **Step 2: Write failing timeline endpoint tests**

Assert:

- first point is month `0`;
- final point is exactly `exitMonths`;
- intermediate points occur every three months;
- a non-quarter exit month is appended exactly once;
- final point values match `calculateEquity`;
- completed rounds increment only at their event month;
- company value uses compound interpolation.

- [ ] **Step 3: Verify RED**

Run:

```bash
bun run test:run lib/equity/timeline.test.ts
```

Expected: FAIL because timeline exports do not exist.

- [ ] **Step 4: Implement funding-round placement**

Use:

```ts
Math.round(input.exitMonths * roundIndex / (input.fundingRounds + 1))
```

where `roundIndex` starts at `1`.

- [ ] **Step 5: Implement timeline generation**

Build a sorted unique month list from quarterly months plus the exact exit month. At each month calculate company value, vested shares, completed rounds, ownership, gross value, exercise cost, and net value.

- [ ] **Step 6: Verify and commit**

Run:

```bash
bun run test:run lib/equity/timeline.test.ts lib/equity/calculate.test.ts
git add lib/equity/timeline.ts lib/equity/timeline.test.ts
git commit -m "feat: generate equity timeline and events"
```

Expected: both suites pass and timeline endpoints match the calculation engine.

---

### Task 5: Comparison State

**Files:**
- Create: `lib/equity/comparisons.test.ts`
- Create: `lib/equity/comparisons.ts`

**Interfaces:**
- Consumes: `EquityScenarioInput`, `SavedScenario`, `calculateEquity`, `generateTimeline`
- Produces: `MAX_SAVED_SCENARIOS = 2` because the editable active scenario is the third visible series
- Produces: `saveScenario(saved, input, name?): SavedScenario[]`
- Produces: `renameScenario(saved, id, name): SavedScenario[]`
- Produces: `removeScenario(saved, id): SavedScenario[]`
- Produces: `ComparisonLimitError`

- [ ] **Step 1: Write failing snapshot tests**

Assert snapshot immutability, generated names (`Baseline`, `Scenario 2`), stable colors, rename trimming, removal, and rejection of a third saved snapshot.

```ts
it("rejects a third saved snapshot because the active scenario is also visible", () => {
  const first = saveScenario([], DEFAULT_PRESET.input);
  const second = saveScenario(
    first,
    { ...DEFAULT_PRESET.input, exitCompanyValue: 2_000_000_000 },
  );

  expect(() =>
    saveScenario(second, {
      ...DEFAULT_PRESET.input,
      exitCompanyValue: 3_000_000_000,
    }),
  ).toThrow(ComparisonLimitError);
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
bun run test:run lib/equity/comparisons.test.ts
```

Expected: FAIL because comparison exports do not exist.

- [ ] **Step 3: Implement pure comparison operations**

Clone inputs on save. Compute result and timeline once per snapshot. Use the approved semantic chart colors in an ordered constant.

- [ ] **Step 4: Verify and commit**

Run:

```bash
bun run test:run lib/equity/comparisons.test.ts
git add lib/equity/comparisons.ts lib/equity/comparisons.test.ts
git commit -m "feat: add scenario comparison snapshots"
```

Expected: all comparison tests pass.

---

### Task 6: Studio Form, Presets, and Last-Valid Behavior

**Files:**
- Create: `components/equity/EquityStudio.test.tsx`
- Create: `components/equity/NumberField.tsx`
- Create: `components/equity/ModeSwitch.tsx`
- Create: `components/equity/ScenarioChips.tsx`
- Create: `components/equity/AssumptionsPanel.tsx`
- Create: `components/equity/useEquityStudio.ts`
- Create: `components/equity/EquityStudio.tsx`

**Interfaces:**
- Consumes: schema, presets, calculation, timeline, comparisons
- Produces: a client component with accessible mode, preset, essential, advanced, and compare interactions
- Produces: `useEquityStudio()` returning `form`, `validInput`, `result`, `timeline`, `activePreset`, `savedScenarios`, and mutation callbacks

- [ ] **Step 1: Write a failing component test for initial hierarchy**

Render `EquityStudio` and assert:

- `New offer` is selected;
- `Series A · typical` is selected;
- the potential net value region precedes the assumptions heading in DOM order;
- grant size displays `20,000`;
- no validation alert is present.

- [ ] **Step 2: Verify RED**

Run:

```bash
bun run test:run components/equity/EquityStudio.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Build semantic mode and preset controls**

Use buttons with `aria-pressed` or a radiogroup with radios. Do not use clickable `div` elements. Preset selection calls `form.reset(clonedPresetInput)`.

- [ ] **Step 4: Build `NumberField` and assumptions sections**

`NumberField` wraps `NumericFormat`, forwards `id`, `name`, `aria-describedby`, `aria-invalid`, `inputMode`, prefix/suffix, and `onBlur`, and preserves an empty draft rather than substituting a fallback.

Essential fields are always visible. Vesting and cap-table details use a native `<details>` element with a clear summary.

- [ ] **Step 5: Implement last-valid scenario behavior**

`useEquityStudio` watches the form draft, calls `equityScenarioSchema.safeParse`, and updates `validInput` only on success. When invalid, it retains the prior valid result and exposes:

```ts
{
  isUsingPreviousResult: true,
  validationSummary: "Results use your last valid assumptions."
}
```

- [ ] **Step 6: Add failing interaction tests**

Test:

- selecting Growth stage updates its values;
- editing any preset-controlled field displays `Custom`;
- switching to Existing equity preserves grant/company values;
- an empty grant field retains the last valid result and shows the previous-result note;
- invalid vested shares are associated with the correct input;
- keyboard activation works for a scenario chip.

- [ ] **Step 7: Verify the interaction tests fail for the missing behavior**

Run the focused component suite and inspect that each new assertion fails for its intended reason.

- [ ] **Step 8: Implement the orchestrator and editor behavior**

Keep saved comparisons in `useState<SavedScenario[]>`. Announce preset changes and comparison errors through a polite live region.

- [ ] **Step 9: Verify and commit**

Run:

```bash
bun run test:run components/equity/EquityStudio.test.tsx
bun run typecheck
git add components/equity lib/equity
git commit -m "feat: add scenario studio inputs and presets"
```

Expected: component tests and typecheck pass.

---

### Task 7: Result, Timeline Chart, and Comparisons UI

**Files:**
- Create: `components/equity/ResultSummary.tsx`
- Create: `components/equity/EquityTimeline.tsx`
- Create: `components/equity/ComparisonTray.tsx`
- Modify: `components/equity/EquityStudio.tsx`
- Modify: `components/equity/EquityStudio.test.tsx`

**Interfaces:**
- `ResultSummary` consumes `{ result: EquityResult; input: EquityScenarioInput; isStale: boolean }`
- `EquityTimeline` consumes `{ active: SavedScenario; comparisons: SavedScenario[]; events: TimelineEvent[] }`, where `active` is an ephemeral series derived from the editable form and `comparisons` contains at most two saved snapshots
- `ComparisonTray` consumes saved scenarios and save/rename/remove/select callbacks

- [ ] **Step 1: Add failing result-summary tests**

Assert:

- primary heading reads `Potential net value at exit`;
- the current net, exercise cost, and exit ownership are present;
- negative net value remains negative and displays explanatory copy;
- stale results carry the last-valid note.

- [ ] **Step 2: Add failing chart-summary tests**

Assert a visually available chart region and a text alternative containing today, exit, vested shares, ownership, exercise cost, and net value. Mock `ResizeObserver` in `vitest.setup.ts`; do not mock the domain data.

- [ ] **Step 3: Add failing comparison interaction tests**

Use Testing Library to save Baseline and Scenario 2, rename one, remove one, and verify a third saved snapshot produces a polite limit message while the active scenario remains visible.

- [ ] **Step 4: Verify RED**

Run:

```bash
bun run test:run components/equity/EquityStudio.test.tsx
```

Expected: the new assertions fail because display components are missing.

- [ ] **Step 5: Implement `ResultSummary`**

Use semantic `section` and `dl` markup. The large result uses tabular numerals and `formatCompactCurrency`, while an accessible full-currency value remains available.

- [ ] **Step 6: Implement `EquityTimeline`**

Use `ResponsiveContainer`, `ComposedChart`, `Area`, `Line`, `XAxis`, `YAxis`, `Tooltip`, and `ReferenceLine` from Recharts. Enable Recharts’ accessibility layer. Use:

- green solid line/area for the active net value;
- coral dashed line for exercise cost;
- distinct accessible colors/dash patterns for saved scenarios;
- exact event labels from `TimelineEvent`.

Disable animation when reduced motion is requested.

- [ ] **Step 7: Implement comparison controls and table**

Use buttons and labeled text inputs. The table must remain readable on mobile by using a card-list presentation below 640 pixels instead of horizontal overflow.

- [ ] **Step 8: Verify and commit**

Run:

```bash
bun run test:run components/equity/EquityStudio.test.tsx
bun run typecheck
git add components/equity vitest.setup.ts
git commit -m "feat: visualize and compare equity scenarios"
```

Expected: result, chart-summary, and comparison tests pass.

---

### Task 8: Approved Visual System and Responsive App Shell

**Files:**
- Create: `components/BrandMark.tsx`
- Modify: `components/Footer.tsx`
- Create: `components/equity/StudioHeader.tsx`
- Create: `components/equity/Methodology.tsx`
- Modify: `components/equity/EquityStudio.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/siteConfig.ts`
- Delete: `tailwind.config.ts`

**Interfaces:**
- Produces the approved light/dark design tokens, editorial/sans typography, page hierarchy, compact methodology, and repository footer

- [ ] **Step 1: Add a failing shell/accessibility test**

Extend the component test to assert one page-level `h1`, a methodology disclosure, pre-tax/liquidation-preference copy, a theme button with an accessible name, and no random tagline.

- [ ] **Step 2: Verify RED**

Expected: assertions fail against the current shell.

- [ ] **Step 3: Implement tokens in Tailwind 4 CSS**

Define semantic CSS custom properties for light and dark themes and map them with `@theme inline`. Add:

- warm paper and surface backgrounds;
- deep ink text;
- green/coral/gold semantic chart colors;
- visible `:focus-visible`;
- `font-variant-numeric: tabular-nums` utility;
- reduced-motion overrides;
- safe overflow rules.

- [ ] **Step 4: Implement typography and metadata**

Use one editorial serif and one compact sans from `next/font/google`, both with CSS variables. Update metadata title and description to match `whatsmyequityworth.com`.

- [ ] **Step 5: Implement the responsive shell**

Desktop:

- max content width approximately 1240 pixels;
- result/chart and assumptions in a balanced two-column workspace;
- comparisons and methodology below.

Mobile:

- 12–16 pixel page gutters;
- chips scroll within their own row, not the page;
- result and chart precede assumptions;
- all primary touch controls at least 44 CSS pixels;
- no fixed-height result cards.

- [ ] **Step 6: Replace the old header/about/footer**

Use the approved “Equity, decoded.” brand treatment. Remove the random tagline, emoji valuation indicators, and long About card. Keep a compact methodology disclosure and financial disclaimer adjacent to the studio.

- [ ] **Step 7: Verify shell tests and commit**

Run:

```bash
bun run test:run components/equity/EquityStudio.test.tsx
bun run lint
bun run typecheck
git add app components
git commit -m "feat: apply responsive equity studio design"
```

Expected: tests, lint, and typecheck pass.

---

### Task 9: Remove Legacy Code and Update Documentation

**Files:**
- Delete: obsolete files listed under Target File Structure
- Modify: `package.json`
- Modify: `bun.lock` through `bun install`
- Modify: `README.md`
- Modify: `.gitignore` or create it if absent
- Modify: `components.json` only if it references deleted aliases/styles

**Interfaces:**
- No new runtime interface; repository documentation and dependency graph match the finished product

- [ ] **Step 1: Delete replaced components and utilities**

Delete only the explicit obsolete-file list. Use `rg` first to confirm no live import references remain.

- [ ] **Step 2: Remove now-unused direct packages**

Remove:

```text
@radix-ui/react-dropdown-menu
@radix-ui/react-slider
@radix-ui/react-slot
@radix-ui/react-toggle
@radix-ui/react-toggle-group
class-variance-authority
tailwindcss-animate
```

Run `bun install` and verify `bun pm ls` has no peer warnings.

- [ ] **Step 3: Remove generated brainstorming/browser artifacts from version control scope**

Add:

```gitignore
.next/
.playwright-cli/
.superpowers/
output/
node_modules/
```

Do not delete the committed spec or implementation plan.

- [ ] **Step 4: Rewrite README around the actual product**

Document:

- new-offer and existing-equity modes;
- presets and custom scenarios;
- vesting/dilution timeline;
- three-scenario comparison;
- explicit model exclusions;
- Bun development commands;
- test, lint, typecheck, and build commands.

- [ ] **Step 5: Run unused-reference and dependency checks**

Run:

```bash
rg "EquityCalculator|RandomTagline|ResultsDisplay|components/ui|utils/calculations" app components lib README.md
bun pm ls
npm outdated --json
```

Expected: no live legacy imports, no peer warnings, and `npm outdated --json` returns no direct dependency update except any documented compatibility exception.

- [ ] **Step 6: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove legacy calculator and refresh docs"
```

---

### Task 10: Full Verification and Visual Review

**Files:**
- Modify only files implicated by a failing verification
- Create screenshots under `output/playwright/` for local review; keep the directory ignored

**Interfaces:**
- No new interface; this task proves the approved experience works

- [ ] **Step 1: Run the full automated gate**

Run:

```bash
bun run check
```

Expected: ESLint, TypeScript, Vitest, and production Next build all pass with pristine output.

- [ ] **Step 2: Start the production server**

Run:

```bash
bun run start
```

Use the port emitted after the successful build.

- [ ] **Step 3: Verify the mobile flow in a real browser**

At `390 × 844`:

- select Early employee;
- edit the exit value;
- switch to Existing equity;
- enter vested shares;
- save baseline and an alternative;
- remove a comparison;
- inspect the chart text and visible tooltip;
- toggle dark mode;
- confirm no horizontal overflow;
- capture a full-page screenshot.

- [ ] **Step 4: Verify tablet and desktop layouts**

At `768 × 1024` and `1440 × 1100`, verify result/assumption order, chart readability, comparison layout, methodology, and theme behavior. Capture the 1440-pixel full-page screenshot.

- [ ] **Step 5: Verify browser health**

Inspect console warnings/errors and network failures. Check keyboard focus order and reduced-motion behavior. Fix any issue, add a regression test when it represents behavior, and rerun `bun run check`.

- [ ] **Step 6: Re-run dependency and git checks**

Run:

```bash
npm outdated --json
git diff --check
git status --short
```

Expected: no outdated direct dependency without a documented exception, no whitespace errors, and only intentional changes.

- [ ] **Step 7: Final verification commit if fixes were required**

```bash
git add -A
git commit -m "fix: resolve final equity studio verification issues"
```

Skip the commit if verification required no file changes.
