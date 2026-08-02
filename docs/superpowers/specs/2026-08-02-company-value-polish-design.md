# Company Value Input Polish

**Date:** 2026-08-02  
**Status:** Approved for implementation planning

## Context

The company-value inputs currently read as oversized spreadsheet cells. Each
row repeats the same shorthand guidance, and the two default values render as
`$120,000,000.00` and `$1,500,000,000.00`. The cents add noise to valuation
figures that are modeled in whole dollars.

The studio intro also contains a decorative `MODEL 01` card with the line
“Adjust the story. Keep the math honest.” The intent is that users can change
assumptions while the studio keeps every result and chart synchronized, but the
card does not communicate that clearly.

## Goals

- Make the two company-value assumptions feel like one related decision.
- Reduce vertical repetition and visual weight.
- Display and emit whole-dollar company values.
- Preserve `m` and `b` shorthand entry.
- Replace decorative model language with direct, useful guidance.
- Preserve validation, keyboard access, responsive behavior, and the
  last-valid calculation boundary.

## Non-goals

- Do not change equity calculations, schemas, presets, charts, comparisons, or
  result formatting.
- Do not add a unit selector or force users to choose between millions and
  billions.
- Do not compact company values into `$120M` after editing; exact dollars remain
  visible.
- Do not change strike-price precision. Strike price continues to support cents.

## Selected Design

### Paired company-value tiles

Inside “What happens next,” place “Company value today” and “Potential exit
value” in one semantic group.

At widths above 700 CSS pixels:

- render two equal-width tiles in one row;
- put each label above its input;
- use a quiet bordered tile surface rather than an oversized row control;
- keep exact values right-aligned with tabular numerals;
- use a 48 CSS-pixel input height.

At 700 CSS pixels and below:

- stack the tiles;
- keep each input full width and at least 44 CSS pixels high;
- preserve right-aligned monetary values;
- create no horizontal page overflow.

Render the guidance once beneath the pair:

> Use full dollars or shorthand like 120m and 1.5b.

Both inputs reference this shared guidance through `aria-describedby`. Field
errors remain attached to the corresponding input and stay inside its tile.

### Whole-dollar behavior

Company-value inputs display whole dollars with the existing
`formatCurrency()` formatter:

- `120m` becomes `$120,000,000`;
- `1.5b` becomes `$1,500,000,000`;
- `$120,000,000.49` becomes `$120,000,000`;
- `12.75` becomes `$13`.

`parseMoneyDraft()` applies the shorthand multiplier first, then rounds the
result to the nearest base dollar. It returns an integer for every valid draft.
This preserves meaningful decimal shorthand while removing hidden cent-level
precision from company valuations.

The existing focused-draft rule remains unchanged: a user draft owns the field
while editing, but a reset, preset, or loaded scenario that arrives during
editing replaces the stale draft on blur. External values use the same
whole-dollar display.

### Direct assumptions guidance

Remove the `MODEL 01` intro card and its slogan.

Add this sentence directly beneath the “Your assumptions” heading:

> Change any assumption. Results and charts update together.

The sentence is descriptive content, not a live-status announcement. It does
not use `aria-live`.

After removing the intro card, rebalance the intro layout so the heading and
scenario choices use the available space without leaving an empty grid column.

## Component Boundaries

### `parseMoneyDraft`

- Continues to accept full dollars, `$`, commas, spaces, and case-insensitive
  `m`/`b` suffixes.
- Multiplies shorthand before rounding.
- Returns a whole-dollar number or `null`.

### `MoneyField`

- Uses `formatCurrency()` rather than the cents formatter for initial values,
  blur formatting, and externally supplied values.
- Preserves the existing uncontrolled draft and external-update reconciliation
  behavior.
- Accepts an optional external description ID so paired fields can share one
  visible help sentence.

### `FieldShell`

- Merges an optional external description ID with its own description and error
  IDs when producing `aria-describedby`.
- Keeps existing callers and default layout behavior unchanged.

### `AssumptionsPanel`

- Groups the two controlled money fields in a `.company-value-group`.
- Renders the shared help sentence once.
- Adds the direct assumptions guidance beneath the panel title.
- Remains the sole owner of equity-specific field organization; React Hook Form
  remains the form state owner.

### `EquityStudio`

- Removes the decorative intro note.
- Does not change scenario, result, timeline, or comparison data flow.

## Error and State Behavior

- Invalid or incomplete drafts continue to emit `null`, show the existing field
  issue, and leave calculations on the last valid input.
- A valid decimal draft becomes a whole-dollar value immediately at the form
  boundary and formats on blur.
- Reset, preset selection, and saved-scenario loading continue to override a
  stale focused draft on blur.
- Each tile presents only its own validation error.

## Accessibility

- Labels remain explicit `<label>` elements.
- Both inputs reference the single shared shorthand sentence.
- Errors remain included in `aria-describedby`.
- Focus indicators retain the existing high-contrast green treatment.
- Tile grouping does not introduce redundant `group` announcements; the
  surrounding “What happens next” heading supplies context.
- Inputs preserve a minimum 44 CSS-pixel target on mobile.

## Verification

### Automated

- Money parsing tests cover whole-dollar rounding and decimal shorthand.
- Money-field tests cover whole-dollar blur formatting, focused external
  updates, and accessible descriptions.
- Assumptions-panel tests confirm one shared helper and both inputs reference it.
- Equity-studio tests confirm the decorative card is absent and the direct
  assumptions guidance is present.
- The complete lint, typecheck, unit-test, audit, and production-build gate
  passes.

### Browser

Verify at 320 × 800, 390 × 844, 768 × 1024, and 1440 × 1000:

- paired tiles sit side by side above 700 CSS pixels and stack at or below it;
- exact values do not overflow;
- values display without cents;
- `12.75`, `120m`, and `1.5b` produce the specified whole-dollar results;
- shared help and validation remain readable;
- reset and preset changes replace stale focused drafts on blur;
- no empty intro column remains after removing the model card;
- keyboard focus is visible and ordered logically;
- light mode, dark mode, and reduced motion remain coherent;
- the page has no horizontal overflow, console warnings, or failed requests.
