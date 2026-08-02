# Company Value Input Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the clunky company-value rows with responsive paired tiles, remove cents from company valuations, and replace the ambiguous `MODEL 01` card with direct assumptions guidance.

**Architecture:** Keep React Hook Form and the last-valid calculation boundary unchanged. Make `parseMoneyDraft()` the whole-dollar normalization boundary, let `MoneyField` own whole-dollar presentation and focused-draft reconciliation, extend `FieldShell` only enough to merge a shared accessible description, and keep equity-specific grouping in `AssumptionsPanel`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, React Hook Form 7, Vitest 4, Testing Library, CSS, Playwright browser verification, Bun

## Global Constraints

- Company-value inputs display and emit whole dollars; strike price continues to support cents.
- `12.75` becomes `$13`.
- `120m` becomes `$120,000,000`.
- `1.5b` becomes `$1,500,000,000`.
- Apply shorthand multiplication before rounding to the nearest base dollar.
- Preserve full-dollar, `$`, comma, space, and case-insensitive `m`/`b` parsing.
- Keep exact full-dollar values visible after blur; do not display compact `$120M` notation.
- Keep React Hook Form as the only form-state owner.
- Preserve the last-valid calculation boundary and stale-focused-draft replacement behavior.
- Render the company values as two equal tiles above 700 CSS pixels and stack them at or below 700 CSS pixels.
- Render the shared guidance exactly once: `Use full dollars or shorthand like 120m and 1.5b.`
- Both money inputs must reference the shared guidance through `aria-describedby`.
- Remove `MODEL 01` and `Adjust the story. Keep the math honest.`
- Add `Change any assumption. Results and charts update together.` beneath `Your assumptions`.
- Do not change schemas, presets, calculations, timelines, comparisons, or result formatting.
- Add no external dependency.
- Preserve light mode, dark mode, reduced motion, visible focus, 44 CSS-pixel mobile targets, and zero horizontal overflow.

---

## File Map

```text
lib/equity/
  money.ts                         # Parse shorthand and normalize to whole dollars
  money.test.ts                    # Whole-dollar parser regression coverage

components/equity/
  FieldShell.tsx                   # Merge an optional external description ID
  FieldShell.test.tsx              # Accessible-description merging regression
  MoneyField.tsx                   # Whole-dollar display and shared description prop
  MoneyField.test.tsx              # Blur, rounding, external update, a11y coverage
  AssumptionsPanel.tsx             # Paired value markup and direct assumptions copy
  AssumptionsPanel.test.tsx        # Shared help and semantic-control integration
  EquityStudio.tsx                 # Remove the decorative model card
  EquityStudio.test.tsx            # Copy removal, whole-dollar, reset/load regressions

app/
  globals.css                      # Tile layout, intro rebalance, responsive styling
```

---

### Task 1: Normalize Company Values to Whole Dollars

**Files:**
- Modify: `lib/equity/money.ts:1-26`
- Modify: `lib/equity/money.test.ts:1-31`
- Modify: `components/equity/MoneyField.tsx:1-97`
- Modify: `components/equity/MoneyField.test.tsx:1-102`
- Modify: `components/equity/EquityStudio.test.tsx:276-374`

**Interfaces:**
- Consumes: `formatCurrency(value: number): string` from `lib/equity/format.ts`
- Produces: `parseMoneyDraft(draft: string): number | null`, always returning an integer for valid drafts
- Produces: `MoneyField`, preserving its current controlled-value callbacks and focused-draft reconciliation

- [ ] **Step 1: Change parser tests to specify whole-dollar output**

Replace the cents test in `lib/equity/money.test.ts` and extend the table:

```ts
it.each([
  ["120000000", 120_000_000],
  ["$120,000,000", 120_000_000],
  ["120m", 120_000_000],
  ["1.2B", 1_200_000_000],
  [" 1.5 b ", 1_500_000_000],
  ["12.75", 13],
  ["$120,000,000.49", 120_000_000],
  ["1.2345b", 1_234_500_000],
])("parses %s as whole base dollars", (draft, expected) => {
  expect(parseMoneyDraft(draft)).toBe(expected);
});

it("rounds after applying shorthand", () => {
  expect(parseMoneyDraft("0.0000015m")).toBe(2);
});
```

Keep the invalid-draft table unchanged.

- [ ] **Step 2: Run the parser tests to verify RED**

Run:

```bash
bun run test:run -- lib/equity/money.test.ts
```

Expected: FAIL because `parseMoneyDraft("12.75")` returns `12.75` and
`parseMoneyDraft("$120,000,000.49")` returns `120000000.49`.

- [ ] **Step 3: Round the multiplied value to a whole dollar**

Change the return in `lib/equity/money.ts`:

```ts
const value = amount * (suffix ? MONEY_MULTIPLIERS[suffix] : 1);

return Number.isFinite(value) ? Math.round(value) : null;
```

Do not round `amount` before applying the suffix.

- [ ] **Step 4: Run the parser tests to verify GREEN**

Run:

```bash
bun run test:run -- lib/equity/money.test.ts
```

Expected: PASS.

- [ ] **Step 5: Change MoneyField tests to require whole-dollar formatting**

Update `components/equity/MoneyField.test.tsx`:

```ts
it("accepts shorthand and formats whole dollars on blur", async () => {
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

it("rounds plain-dollar decimals on change and blur", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();

  render(
    <MoneyField
      id="currentCompanyValue"
      label="Company value today"
      value={0}
      onChange={onChange}
      onBlur={vi.fn()}
    />,
  );

  const input = screen.getByLabelText("Company value today");
  await user.clear(input);
  await user.type(input, "12.75");
  expect(onChange).toHaveBeenLastCalledWith(13);

  await user.tab();
  expect(input).toHaveValue("$13");
});
```

Update the focused external-value test to expect `$4` after supplying `3.5`.

- [ ] **Step 6: Update integration assertions to whole dollars**

In `components/equity/EquityStudio.test.tsx`, change:

```ts
expect(screen.getByLabelText("Potential exit value")).toHaveValue(
  "$1,500,000,000",
);
```

and:

```ts
expect(exitValue).toHaveValue("$2,000,000,000");
```

Add this integration case:

```ts
it("rounds plain-dollar company values without adding cents", async () => {
  const user = userEvent.setup();
  render(<EquityStudio />);

  const currentValue = screen.getByLabelText("Company value today");
  await user.clear(currentValue);
  await user.type(currentValue, "12.75");
  await user.tab();

  expect(currentValue).toHaveValue("$13");
  expect(
    screen.queryByText("Results use your last valid assumptions."),
  ).not.toBeInTheDocument();
});
```

- [ ] **Step 7: Run MoneyField and integration tests to verify RED**

Run:

```bash
bun run test:run -- components/equity/MoneyField.test.tsx components/equity/EquityStudio.test.tsx
```

Expected: FAIL because `MoneyField` still uses `formatCurrencyToCents()`.

- [ ] **Step 8: Switch MoneyField presentation to whole dollars**

In `components/equity/MoneyField.tsx`, replace:

```ts
import { formatCurrencyToCents } from "@/lib/equity/format";
```

with:

```ts
import { formatCurrency } from "@/lib/equity/format";
```

Use `formatCurrency()` in all four presentation paths:

```ts
inputRef.current.value = value === null ? "" : formatCurrency(value);
```

```ts
defaultValue={value === null ? "" : formatCurrency(value)}
```

```ts
event.currentTarget.value =
  externalValue === null ? "" : formatCurrency(externalValue);
```

```ts
event.currentTarget.value = formatCurrency(parsed);
```

Keep `inputMode="decimal"` because decimal shorthand such as `1.5b` remains
valid.

- [ ] **Step 9: Run the focused whole-dollar suite**

Run:

```bash
bun run test:run -- lib/equity/money.test.ts components/equity/MoneyField.test.tsx components/equity/EquityStudio.test.tsx
```

Expected: PASS with no console warnings.

- [ ] **Step 10: Verify no cents-specific company-value path remains**

Run:

```bash
rg -n "formatCurrencyToCents|\\$1,500,000,000\\.00|\\$2,000,000,000\\.00" \
  components/equity lib/equity/money.test.ts
```

Expected: no matches. `formatCurrencyToCents` remains exported from
`lib/equity/format.ts`, outside this search scope, because this change does not
need an unrelated formatter deletion.

- [ ] **Step 11: Commit the whole-dollar behavior**

```bash
git add lib/equity/money.ts lib/equity/money.test.ts \
  components/equity/MoneyField.tsx \
  components/equity/MoneyField.test.tsx \
  components/equity/EquityStudio.test.tsx
git commit -m "fix: simplify company values to whole dollars"
```

---

### Task 2: Build the Paired Value Tiles and Clarify the Model Copy

**Files:**
- Modify: `components/equity/FieldShell.tsx:1-52`
- Modify: `components/equity/FieldShell.test.tsx:1-31`
- Modify: `components/equity/MoneyField.tsx:10-97`
- Modify: `components/equity/MoneyField.test.tsx:82-102`
- Modify: `components/equity/AssumptionsPanel.tsx:24-248`
- Modify: `components/equity/AssumptionsPanel.test.tsx:1-42`
- Modify: `components/equity/EquityStudio.tsx:16-39`
- Modify: `components/equity/EquityStudio.test.tsx:7-24`
- Modify: `app/globals.css:268-353`
- Modify: `app/globals.css:749-995`
- Modify: `app/globals.css:1268-1307`

**Interfaces:**
- Consumes: whole-dollar `MoneyField` behavior from Task 1
- Produces: `FieldShellProps.externalDescribedBy?: string`
- Produces: `MoneyFieldProps.externalDescribedBy?: string`
- Produces: `.company-value-group`, `.company-value-grid`, `.company-value-help`, and `.assumptions-intro`

- [ ] **Step 1: Write the failing shared-description test**

Extend `components/equity/FieldShell.test.tsx`:

```tsx
it("merges an external shared description with its own error", () => {
  render(
    <>
      <p id="company-value-help">
        Use full dollars or shorthand like 120m and 1.5b.
      </p>
      <FieldShell
        id="currentCompanyValue"
        label="Company value today"
        externalDescribedBy="company-value-help"
        error="Must be greater than zero"
      >
        {({ describedBy, invalid }) => (
          <input
            id="currentCompanyValue"
            aria-describedby={describedBy}
            aria-invalid={invalid}
          />
        )}
      </FieldShell>
    </>,
  );

  expect(screen.getByLabelText("Company value today")).toHaveAccessibleDescription(
    "Use full dollars or shorthand like 120m and 1.5b. Must be greater than zero",
  );
});
```

- [ ] **Step 2: Run the FieldShell test to verify RED**

Run:

```bash
bun run test:run -- components/equity/FieldShell.test.tsx
```

Expected: TypeScript compilation FAIL because `externalDescribedBy` does not
exist.

- [ ] **Step 3: Add external description merging to FieldShell**

Change `FieldShellProps`:

```ts
interface FieldShellProps {
  id: string;
  label: string;
  description?: string;
  externalDescribedBy?: string;
  error?: string;
  rich?: boolean;
  children: (a11y: FieldControlA11y) => ReactNode;
}
```

Destructure `externalDescribedBy`, then create the merged ID list:

```ts
const describedBy =
  [externalDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") ||
  undefined;
```

Do not change default markup or existing description order.

- [ ] **Step 4: Run FieldShell tests to verify GREEN**

Run:

```bash
bun run test:run -- components/equity/FieldShell.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write the failing MoneyField shared-description test**

Add to `components/equity/MoneyField.test.tsx`:

```tsx
it("references shared guidance supplied by its parent group", () => {
  render(
    <>
      <p id="company-value-help">
        Use full dollars or shorthand like 120m and 1.5b.
      </p>
      <MoneyField
        id="currentCompanyValue"
        label="Company value today"
        value={120_000_000}
        externalDescribedBy="company-value-help"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />
    </>,
  );

  expect(screen.getByLabelText("Company value today")).toHaveAccessibleDescription(
    "Use full dollars or shorthand like 120m and 1.5b.",
  );
});
```

- [ ] **Step 6: Run the MoneyField test to verify RED**

Run:

```bash
bun run test:run -- components/equity/MoneyField.test.tsx
```

Expected: TypeScript compilation FAIL because `externalDescribedBy` does not
exist on `MoneyFieldProps`.

- [ ] **Step 7: Pass the shared description through MoneyField**

Add to `MoneyFieldProps`:

```ts
externalDescribedBy?: string;
```

Destructure the prop and pass it into `FieldShell`:

```tsx
<FieldShell
  id={id}
  label={label}
  description={description}
  externalDescribedBy={externalDescribedBy}
  error={error}
>
```

- [ ] **Step 8: Run FieldShell and MoneyField tests to verify GREEN**

Run:

```bash
bun run test:run -- components/equity/FieldShell.test.tsx components/equity/MoneyField.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Write the failing assumptions-panel layout and copy test**

Extend `components/equity/AssumptionsPanel.test.tsx`:

```tsx
it("groups company values with one shared explanation", () => {
  const { container } = render(<EquityStudio />);

  const help = screen.getByText(
    "Use full dollars or shorthand like 120m and 1.5b.",
  );
  const current = screen.getByLabelText("Company value today");
  const exit = screen.getByLabelText("Potential exit value");
  const grid = container.querySelector(".company-value-grid");

  expect(grid).not.toBeNull();
  expect(grid).toContainElement(current);
  expect(grid).toContainElement(exit);
  expect(
    screen.getAllByText(
      "Use full dollars or shorthand like 120m and 1.5b.",
    ),
  ).toHaveLength(1);
  expect(current.getAttribute("aria-describedby")).toContain(help.id);
  expect(exit.getAttribute("aria-describedby")).toContain(help.id);
});

it("explains assumption updates directly", () => {
  render(<EquityStudio />);

  expect(
    screen.getByText(
      "Change any assumption. Results and charts update together.",
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByText("Adjust the story. Keep the math honest."),
  ).not.toBeInTheDocument();
});
```

- [ ] **Step 10: Run panel tests to verify RED**

Run:

```bash
bun run test:run -- components/equity/AssumptionsPanel.test.tsx
```

Expected: FAIL because the grid, shared help, and direct assumptions copy do not
exist.

- [ ] **Step 11: Add the paired markup and direct assumptions copy**

Extend `ControlledFieldProps` in `AssumptionsPanel.tsx`:

```ts
externalDescribedBy?: string;
```

Destructure it in `ControlledMoneyField` and pass it to `MoneyField`.

Add beneath the assumptions heading:

```tsx
<p className="assumptions-intro">
  Change any assumption. Results and charts update together.
</p>
```

Replace the two independent money rows with:

```tsx
<div className="company-value-group">
  <div className="company-value-grid">
    <ControlledMoneyField
      {...shared}
      name="currentCompanyValue"
      label="Company value today"
      externalDescribedBy="company-value-help"
    />
    <ControlledMoneyField
      {...shared}
      name="exitCompanyValue"
      label="Potential exit value"
      externalDescribedBy="company-value-help"
    />
  </div>
  <p id="company-value-help" className="company-value-help">
    Use full dollars or shorthand like 120m and 1.5b.
  </p>
</div>
```

Do not add `role="group"`; the visible section heading already supplies
context.

- [ ] **Step 12: Remove the decorative model card**

Delete this block from `EquityStudio.tsx`:

```tsx
<div className="intro-note" aria-hidden="true">
  <span>Model</span>
  <strong>01</strong>
  <small>Adjust the story. Keep the math honest.</small>
</div>
```

Keep the intro heading and `ScenarioChips` order unchanged.

- [ ] **Step 13: Run panel and studio tests**

Run:

```bash
bun run test:run -- components/equity/FieldShell.test.tsx components/equity/MoneyField.test.tsx components/equity/AssumptionsPanel.test.tsx components/equity/EquityStudio.test.tsx
```

Expected: PASS.

- [ ] **Step 14: Add the paired tile visual system**

In `app/globals.css`, add after `.field-list`:

```css
.assumptions-intro {
  max-width: 260px;
  margin: 7px 0 0;
  color: var(--ink-faint);
  font-size: 10px;
  line-height: 1.45;
}

.company-value-group {
  padding: 11px 0 14px;
  border-top: 1px solid var(--border);
}

.company-value-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.company-value-grid .field-group {
  grid-template-columns: 1fr;
  align-items: start;
  gap: 9px;
  min-height: 0;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface-muted) 72%, var(--surface));
}

.company-value-grid .field-copy label {
  font-size: 11px;
}

.company-value-grid .field-control input {
  min-height: 48px;
  font-size: 16px;
  text-align: right;
}

.company-value-help {
  margin: 9px 1px 0;
  color: var(--ink-faint);
  font-size: 10px;
  line-height: 1.4;
}
```

The field error remains inside each `.field-group`.

- [ ] **Step 15: Rebalance the intro and remove dead card CSS**

Change `.studio-intro` to:

```css
.studio-intro {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 30px;
  padding: clamp(52px, 8vw, 96px) 0 36px;
}
```

Delete the complete `.intro-note`, `.intro-note span`, `.intro-note small`, and
`.intro-note strong` rule blocks.

Delete the mobile-only `.intro-note { display: none; }` rule because the element
no longer exists.

Keep `.scenario-strip { grid-column: 1 / -1; }`; it remains valid in a
single-column grid.

- [ ] **Step 16: Add mobile stacking without losing monetary alignment**

Inside the existing `@media (max-width: 700px)` semantic-control block, add:

```css
.company-value-grid {
  grid-template-columns: 1fr;
}

.company-value-grid .field-control input {
  text-align: right;
}
```

Place the override after the general mobile `.field-control input {
text-align: left; }` rule.

- [ ] **Step 17: Run the focused UI suite**

Run:

```bash
bun run test:run -- components/equity/FieldShell.test.tsx components/equity/MoneyField.test.tsx components/equity/AssumptionsPanel.test.tsx components/equity/EquityStudio.test.tsx lib/equity/money.test.ts
```

Expected: PASS with no console warnings.

- [ ] **Step 18: Run the complete automated gate**

Run:

```bash
bun install --frozen-lockfile
bun run check
git diff --check
```

Expected:

- the frozen install makes no changes;
- `bun audit` reports no vulnerabilities;
- ESLint and TypeScript pass;
- all Vitest tests pass;
- the production build succeeds;
- `/` remains statically generated;
- `git diff --check` prints nothing.

- [ ] **Step 19: Verify the production UI in a real browser**

Build first through Step 18, then run:

```bash
bun run start -- --hostname 127.0.0.1 --port 3100
```

Using the Playwright skill, verify:

1. At 768 × 1024 and 1440 × 1000, the two value tiles are equal-width and side
   by side.
2. At 320 × 800 and 390 × 844, the tiles stack in label → input order.
3. Every company-value input is at least 44 CSS pixels high and stays within its
   tile.
4. `$120,000,000` and `$1,500,000,000` render without cents or clipping.
5. `12.75` blurs to `$13`.
6. `120m` blurs to `$120,000,000`.
7. `1.5b` blurs to `$1,500,000,000`.
8. The shared guidance renders exactly once and both inputs reference it.
9. Clearing a value keeps the previous result and exposes its existing field
   issue after blur.
10. A reset or preset change during a focused stale draft wins on blur.
11. `MODEL 01` and its slogan are absent.
12. The direct assumptions guidance is visible under `Your assumptions`.
13. The intro has no empty right column at desktop widths.
14. Focus order and focus visibility remain logical.
15. Light mode, dark mode, and reduced motion remain coherent.
16. `document.documentElement.scrollWidth === window.innerWidth` at every
    viewport.
17. The console contains zero warnings/errors and all static requests succeed.

Save screenshots at all four viewports for the implementation report.

- [ ] **Step 20: Commit the paired input design**

```bash
git add app/globals.css \
  components/equity/FieldShell.tsx \
  components/equity/FieldShell.test.tsx \
  components/equity/MoneyField.tsx \
  components/equity/MoneyField.test.tsx \
  components/equity/AssumptionsPanel.tsx \
  components/equity/AssumptionsPanel.test.tsx \
  components/equity/EquityStudio.tsx \
  components/equity/EquityStudio.test.tsx
git commit -m "feat: refine company value assumptions"
```

- [ ] **Step 21: Verify the exact commit and update PR #2**

Run:

```bash
bun install --frozen-lockfile
bun run check
git diff --check
git status -sb
git log -2 --oneline
git push
gh pr view 2 --json url,isDraft,state,mergeable,mergeStateStatus,baseRefName,headRefName,headRefOid,statusCheckRollup
```

Expected:

- all exact-commit gates pass;
- the worktree is clean;
- local `HEAD` matches `origin/codex/equity-scenario-studio`;
- PR #2 remains open and ready for review against `main`;
- PR #2 is mergeable and clean;
- Vercel checks begin or complete successfully.
