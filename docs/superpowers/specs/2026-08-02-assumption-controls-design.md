# Semantic Assumption Controls

**Date:** August 2, 2026  
**Status:** Approved design, pending written-spec review

## Purpose

Replace the scenario studio's one-control-fits-all assumptions form with a
semantic control system. Each assumption should use the interaction that best
matches its range, precision, and role in the decision:

- exact contractual and cap-table values stay exact inputs;
- common time horizons become one-tap choices without blocking custom values;
- small discrete counts become steppers;
- dilution becomes directly explorable with a slider and exact percentage
  input.

The redesign must make common scenarios faster to model on mobile while
preserving arbitrary valid values such as a 43-month exit or 17.5% dilution.

## Current Product Assessment

The current `AssumptionsPanel` renders every numeric value through the same
`NumberField`. This is technically consistent but interactionally flat:

- users type values that naturally belong to a small choice set;
- future funding rounds require keyboard editing despite being a bounded whole
  number from 0 through 10;
- dilution cannot be stress-tested by direct manipulation;
- time values expose raw months without helping users recognize common
  two-, three-, four-, and five-year horizons;
- the flat list does not distinguish grant facts from future assumptions;
- on mobile, every field receives the same visual weight regardless of its
  decision value.

The existing form, validation, last-valid projection behavior, presets,
comparison snapshots, calculation engine, and timeline model are sound and
remain the source of truth.

## Design Principles

1. **Semantics over consistency.** Controls may look related without being
   mechanically identical.
2. **Fast defaults, exact escape hatch.** Common values take one tap, while an
   exact field remains available in the same control.
3. **No false precision.** Large valuations do not become sliders because
   their useful ranges span orders of magnitude.
4. **One value, many representations.** A slider, quick-choice button, and
   exact input must never own competing state.
5. **Result-first continuity.** Invalid or incomplete drafts keep the last
   valid result and chart visible.
6. **Mobile is the primary constraint.** Every control must work comfortably
   at 320 CSS pixels without horizontal page scrolling.

## Assumption Groups

The panel becomes three clearly titled sections.

### Your grant

These are facts the user should copy exactly from an offer, grant notice, or
cap table:

- grant size;
- strike price;
- fully diluted company shares.

### What happens next

These are scenario assumptions users will actively explore:

- company value today;
- potential exit value;
- time to exit;
- future funding rounds;
- dilution per round.

### Vesting details

These remain progressively disclosed:

- total vesting term;
- vesting cliff;
- vested shares today in existing-equity mode;
- remaining vesting in existing-equity mode.

The existing mode-specific behavior remains unchanged. The first two sections
are visible; `Vesting details` remains collapsible.

## Field-Level Control Decisions

### Grant size

Use the existing formatted numeric input with thousands separators. The value
is an exact share count and accepts whole numbers only.

### Strike price

Use an exact currency input with two decimal places. Do not add a slider or
choice shortcuts.

### Fully diluted company shares

Use the existing formatted numeric input with thousands separators. This is an
exact cap-table value and accepts whole numbers only.

### Company value today

Use a currency input that accepts both full numbers and case-insensitive
shorthand:

- `120000000`;
- `$120,000,000`;
- `120m`;
- `1.2b`.

On blur, normalize the display to the full formatted currency value. The
calculation model continues to receive base dollars.

### Potential exit value

Use the same currency input and shorthand behavior as company value today.
Do not use a slider: the range spans orders of magnitude, and a linear track
would imply a confidence the model does not have.

### Time to exit

Use a `QuickChoiceField` containing:

- `2 years` → 24 months;
- `3 years` → 36 months;
- `4 years` → 48 months;
- `5 years` → 60 months.

Place a compact exact month input beside or immediately below the choices.
Values remain whole months from 1 through 180. When the current value matches a
choice, that choice is pressed. A custom value such as 43 months leaves every
choice unpressed while the exact field remains visible.

### Future funding rounds

Use a `StepperField` with:

- a decrease button;
- a prominent current value;
- an increase button.

The control changes in whole-number steps between 0 and 10. The decrease or
increase button is disabled at its respective boundary. The current value is
also an exact numeric input so a user can type a number directly.

### Dilution per round

Use a `SliderNumberField` with a native range control and a paired exact
percentage input.

- slider range: 0 through 99.9%;
- slider step: 0.1 percentage points;
- exact input range: 0 inclusive through 100 exclusive;
- exact input precision: one decimal place.

The track labels emphasize the common 0–40% exploration region without
restricting the valid range. A native range control is preferred over a new
dependency because it provides mature keyboard semantics and mobile pointer
behavior.

### Total vesting term

Use a `QuickChoiceField` containing:

- `3 years` → 36 months;
- `4 years` → 48 months;
- `5 years` → 60 months.

Keep the exact month input. Values follow the existing schema bounds.

### Vesting cliff

Use a `QuickChoiceField` containing:

- `None` → 0 months;
- `6 months` → 6 months;
- `12 months` → 12 months.

Keep the exact month input. Existing validation continues to prevent a cliff
from exceeding the total vesting term.

### Vested shares today

Use the existing exact formatted share input. The value should be copied from
the user's records and must not become a slider.

### Remaining vesting

Use a `QuickChoiceField` containing:

- `1 year` → 12 months;
- `2 years` → 24 months;
- `3 years` → 36 months;
- `4 years` → 48 months.

Keep the exact month input. Zero remains valid for a fully vested grant even
though it is not a quick choice.

## Interaction Behavior

All controls are controlled by the existing React Hook Form instance.

1. A quick choice, stepper button, or slider emits one numeric value.
2. The form controller stores that value.
3. `updateLastValidField` validates the complete draft.
4. A valid draft becomes the current projection and comparison input.
5. An invalid or incomplete draft leaves the last valid result and timeline in
   place.

There is no second component-level source of scenario truth.

### Synchronization

- Choosing a shortcut updates its exact input.
- Typing a matching value selects the corresponding shortcut.
- Typing a custom value clears all shortcut pressed states.
- Moving the dilution slider updates the exact percentage input.
- Typing an exact percentage moves the slider.
- Resetting or loading a preset updates every representation in one render.
- Loading a saved comparison behaves like loading a preset.
- Any semantic control edit changes the active scenario to `Custom` unless the
  complete input exactly matches a preset.

### Incomplete Drafts

The exact input may temporarily contain no parsable number while a user edits
it. During that interval:

- the exact field displays the draft;
- the slider or shortcut presentation uses the last valid value;
- the result and chart use the last valid complete scenario;
- the existing previous-result message remains visible;
- validation feedback appears according to the current on-blur behavior.

The application must not coerce an empty draft to zero.

### Boundaries

Stepper and slider interactions cannot exceed their declared bounds. Direct
inputs are not silently clamped; invalid values remain visible and receive the
existing schema error. This lets users understand what needs correction.

## Component Architecture

### `FieldShell`

Owns the shared field presentation:

- label;
- optional description;
- error text;
- `aria-describedby` wiring;
- consistent spacing.

It does not own form state.

### `NumberField`

Continues to handle exact shares and simple currency values. It is refactored
to use `FieldShell` without changing its public behavior.

### `MoneyField`

Handles full-number and M/B shorthand parsing for company values. It emits base
dollars and formats the display on blur.

### `QuickChoiceField`

Renders a labeled group of pressed/unpressed choice buttons plus an exact
number input. It receives a readonly choice catalog and has no knowledge of
equity-specific field names.

### `StepperField`

Renders decrease, exact value, and increase controls. It owns boundary
presentation but receives the actual value and callbacks from the form.

### `SliderNumberField`

Renders a native range input, exact numeric input, track labels, and shared
error presentation. It accepts min, max, step, and display-format options.

### `AssumptionsPanel`

Owns only equity-specific field definitions, section organization, and React
Hook Form controllers. It chooses the semantic component for each definition
and passes the existing `issues` and `onFieldChange` behavior through.

The calculation, schema, presets, timeline, and comparison modules do not
depend on these presentation components and require no algorithm changes.

## Layout and Visual Treatment

The controls extend the existing editorial scenario-studio visual language
rather than introducing a separate design system.

- Section titles act as orientation, not decoration.
- Quick choices use quiet outlined pills; only the selected value receives the
  green filled state.
- The funding stepper reads as one connected control rather than three
  unrelated buttons.
- The dilution thumb uses the existing green, with a high-contrast focus ring
  and a restrained filled track.
- Exact values retain tabular numerals.
- Controls receive subtle value-change transitions only when reduced motion is
  not requested.

Desktop may place a label and compact control on one row. Any rich control
that needs more horizontal space spans the panel width beneath its label.

At 700 CSS pixels and below:

- all rich controls stack under their labels;
- choice buttons wrap rather than scroll horizontally;
- the slider uses the full available width;
- exact inputs remain at least 44 CSS pixels high;
- stepper buttons are at least 44 by 44 CSS pixels;
- no section creates horizontal page overflow.

## Accessibility

### Quick choices

Use a labeled `role="group"` with buttons that expose `aria-pressed`. A group
may intentionally have no pressed button when the exact value is custom, so
radio semantics are not used.

### Stepper

The exact input has the field's visible label. The buttons use explicit names:

- `Decrease future funding rounds`;
- `Increase future funding rounds`.

Disabled boundary buttons use the native `disabled` attribute.

### Slider

The native range input receives its own descriptive label, such as
`Adjust dilution per round`. It supports arrows, Page Up/Down, Home, and End
through native behavior. `aria-valuetext` includes the formatted percentage.
The paired exact field remains the primary precisely editable input.

### Errors and announcements

Errors remain associated with the exact input through `aria-describedby` and
`aria-invalid`. Invalid drafts do not remove the headline result, chart, or
comparison context. Existing status messages continue to announce preset,
custom, and previous-result changes.

All text, borders, slider parts, pressed states, and focus indicators must meet
the current WCAG 2.2 AA targets in light and dark themes.

## Testing Strategy

### Focused component tests

Add tests for:

- a quick choice updating its exact input;
- a matching exact value selecting a quick choice;
- a custom exact value clearing quick-choice pressed states;
- a stepper changing by one and disabling at 0 and 10;
- the funding-round exact input accepting a typed whole number;
- the slider and exact percentage input synchronizing in both directions;
- slider keyboard operation;
- exact currency shorthand normalization for M and B;
- invalid and incomplete exact inputs preserving the last valid result;
- error association on each composite control.

### Studio integration tests

Extend `EquityStudio.test.tsx` to verify:

- Series A defaults select the four-year, two-round, and 18% controls;
- presets and reset synchronize all semantic controls;
- loading a saved scenario synchronizes all semantic controls;
- edits still change the active scenario to `Custom`;
- existing-equity mode exposes the correct vested and remaining-vesting
  controls;
- an exact 43-month exit and 17.5% dilution produce a valid live result;
- negative-outcome and comparison behavior remain unchanged.

### Browser verification

Verify production behavior at:

- 320 × 800;
- 390 × 844;
- 768 × 1024;
- 1440 × 1000.

The browser pass must cover:

- no horizontal overflow;
- 44 CSS-pixel touch targets;
- choice wrapping;
- slider pointer and keyboard behavior;
- focus order and visible focus;
- light and dark themes;
- reduced motion;
- zero console warnings or errors.

Run the full lint, typecheck, Vitest, and production-build gate before
completion.

## Scope Boundaries

This change does not:

- alter equity calculations or validation bounds;
- add market benchmarks or recommend assumption values;
- introduce a form wizard;
- make every numeric value a slider;
- add persistence, accounts, or URL sharing;
- change the chart's financial model;
- add an external component dependency solely for these controls.

The work is limited to assumption-control semantics, field organization,
formatting ergonomics, accessibility, and responsive presentation.
