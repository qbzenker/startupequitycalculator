# Startup Equity Scenario Studio Redesign

**Date:** July 31, 2026  
**Status:** Approved design, pending written-spec review

## Purpose

Turn the current form-heavy startup equity calculator into a mobile-first scenario studio for two related jobs:

1. evaluating a new equity offer;
2. understanding an existing equity grant.

The redesigned product should give users a useful answer before asking them to understand every input. It should make uncertainty visible, explain the important financial mechanics in plain language, and feel trustworthy without becoming sterile.

## Current Product Assessment

The existing application has a sound core idea and immediate recalculation, but the product is organized around its input form rather than the user’s decision.

- Mobile users scroll through every input before seeing a result.
- Current and future results are visually disconnected from the assumptions that created them.
- Sliders and alternative inputs introduce density without a clear progressive hierarchy.
- The result cards repeat labels and emphasize large numbers without explaining their uncertainty.
- Random taglines, emoji valuation indicators, and a long “About” section compete with the calculation.
- The calculation engine accepts `any`, mixes calculation with formatting, and has no automated tests.
- The timeline and multiple-scenario features described in the README do not exist.
- The package set is based on Next.js 15.3 and has multiple current major-version upgrades available.

## Product Goals

The redesign must:

- support both new-offer and existing-equity workflows;
- default to the new-offer workflow;
- show a meaningful result and chart before the full input form on mobile;
- provide realistic example scenarios without presenting them as market benchmarks;
- let users compare up to three scenarios;
- show vesting, dilution, exercise cost, and exit value over time;
- remain fully usable without an account, backend, or external service;
- preserve dark mode;
- work at 320 CSS pixels wide without horizontal page scrolling;
- meet WCAG 2.2 AA contrast and interaction expectations;
- never display `NaN`, `Infinity`, or a broken chart;
- clearly state that all values are pre-tax estimates and exclude liquidation preferences.

## Chosen Product Direction

Use a **scenario studio** rather than a wizard or dense analyst dashboard.

The scenario studio combines:

- the immediacy of a dashboard;
- the approachable defaults of a guided tool;
- progressive disclosure for detailed assumptions;
- direct manipulation through scenario chips;
- a result-first mobile hierarchy.

The user should always understand which scenario is active, what assumptions drive it, and whether the scenario still matches a preset or has become custom.

## Experience Structure

### Global Header

The header contains:

- the compact “Equity, decoded.” wordmark;
- the `New offer` / `Existing equity` mode switch;
- the light/dark theme control.

The mode switch is a semantic single-choice control. Changing modes preserves compatible values and initializes only the mode-specific fields.

### Introductory Copy

The primary heading is:

> What could your startup equity become?

Supporting copy is:

> Model the upside, the dilution, and what it may cost to own.

The interface does not use a random tagline. Small moments of wit may appear in educational microcopy, but never in calculated values or warnings.

### Scenario Chips

Scenario chips appear immediately below the intro copy. Each chip fills the complete active scenario. Selecting a chip is reversible, keyboard operable, and announces the change to assistive technology.

The initial presets are examples, not market benchmarks:

| Preset | Grant | Strike | Fully diluted shares | Current value | Exit value | Exit timing | Future rounds | Dilution per round |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Early employee | 40,000 | $0.20 | 10,000,000 | $40M | $500M | 5 years | 3 | 20% |
| Series A · typical | 20,000 | $1.25 | 20,000,000 | $120M | $1.5B | 4 years | 2 | 18% |
| Growth stage | 8,000 | $6.00 | 80,000,000 | $1.2B | $4B | 3 years | 1 | 12% |
| Conservative case | 20,000 | $1.25 | 20,000,000 | $120M | $400M | 4 years | 2 | 20% |

All new-offer presets use a four-year vesting period with a 12-month cliff. `Series A · typical` is the default.

When any preset-controlled input changes, the active chip becomes `Custom`. Resetting every value to a preset’s exact values restores that preset label.

### Result Summary

The result leads the main workspace.

The primary result is:

> Potential net value at exit

This value equals the gross value of shares vested by the modeled exit minus the cost to exercise those shares. It is pre-tax.

Three supporting metrics appear nearby:

- current vested net value;
- exercise cost at exit;
- ownership at exit.

The caption under the primary value summarizes the most decision-relevant assumptions, for example:

> At a $1.5B exit after exercise cost and two future rounds.

Negative net values remain negative and use explanatory copy. They are not clamped to zero.

### Value-Over-Time Chart

The chart plots quarterly points from today through the selected exit month.

It includes:

- vested net value as the primary line and area;
- cumulative exercise cost as a secondary line;
- a one-year cliff marker when applicable;
- future funding/dilution event markers;
- a full-vesting marker;
- an exit marker;
- tooltips with date offset, vested shares, ownership, company value, gross equity value, exercise cost, and net value;
- a text summary containing the same essential information for users who cannot perceive the chart.

For the company-value path between the current and exit valuations, use compound interpolation:

```text
companyValueAtMonth =
  currentCompanyValue × (exitValue / currentCompanyValue)^(month / exitMonth)
```

Future rounds are evenly spaced at strictly future fractional months because
the model asks for a count rather than round dates. For round `i`, where `i`
starts at `1`, its event month is:

```text
exitMonths × i / (fundingRounds + 1)
```

A dilution event is applied when its event month is reached. Keeping the
fractional spacing prevents an early round from rounding back to month zero
when the modeled exit horizon is shorter than the number of round intervals.

The chart communicates a model, not historical performance. It does not imply a guaranteed smooth valuation path.

### Assumptions

Essential assumptions stay visible on desktop beside the result:

- grant size;
- strike price;
- fully diluted share count;
- current company value;
- potential exit value;
- time to exit;
- future funding rounds;
- dilution per round.

Vesting and cap-table details use progressive disclosure.

New-offer mode provides:

- total vesting months, default `48`;
- cliff months, default `12`.

Existing-equity mode additionally provides:

- vested shares today;
- remaining vesting months.

Existing-equity projections grow vested shares linearly from the current vested count to the grant total over the remaining vesting months. This intentionally avoids inventing a historical vesting start date.

On mobile:

1. mode and scenario chips appear first;
2. the result summary appears next;
3. the timeline chart follows;
4. a compact assumption summary links to the editable assumptions;
5. assumptions appear as short, clearly titled sections;
6. comparison controls appear after the active scenario.

The mobile page does not place every input before the answer and does not use a blocking full-screen wizard.

### Comparison

`Compare this scenario` saves a snapshot of the active scenario. Users may compare the editable active scenario plus two saved snapshots, for three visible scenarios total.

- The first saved snapshot is named `Baseline`; the second is named `Scenario 2`. Both receive distinct chart colors.
- The active scenario remains editable and uses the primary chart color.
- Each comparison can be selected, renamed, or removed.
- The chart overlays net-value lines for all saved scenarios.
- A compact comparison table shows exit value, dilution, ownership at exit, exercise cost, and net value.
- When two snapshots are saved, the interface explains that one must be removed before the active scenario can be saved again.

Comparisons exist only in the current browser session. Persistence, accounts, and shareable URLs are outside this redesign.

## Calculation Model

### Typed Inputs

The calculation engine accepts a validated numeric model:

```ts
type EquityMode = "new-offer" | "existing-equity";

interface EquityScenarioInput {
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
```

All values use base units: dollars, shares, percentage points, and months. Display suffixes such as `M` and `B` are input and formatting concerns, not calculation-engine values.

### Ownership and Dilution

Initial fully diluted ownership is:

```text
grantShares / totalCompanyShares
```

Ownership after a given number of rounds is:

```text
initialOwnership × (1 - dilutionPerRound / 100)^completedRounds
```

This model assumes equal dilution in every future round and does not model option-pool refreshes separately.

### Vesting

For new offers:

- zero shares vest before the cliff;
- at the cliff, the proportional cliff amount vests;
- after the cliff, shares vest linearly through the end of the vesting term;
- the result is capped at the grant total.

For existing equity:

- the current vested count is used at month zero;
- remaining shares vest linearly across the remaining vesting months;
- the result is capped at the grant total.

No vesting acceleration is assumed at exit.

### Value

At each point:

```text
vestedOwnership = vestedShares / totalCompanyShares × cumulativeDilutionFactor
grossEquityValue = companyValueAtPoint × vestedOwnership
exerciseCost = vestedShares × strikePrice
netEquityValue = grossEquityValue - exerciseCost
```

The headline result uses the exit point. Current value uses today’s vested shares and today’s company value without future dilution.

### Explicit Exclusions

The model excludes:

- taxes, including AMT;
- liquidation preferences;
- participating preferred structures;
- secondary-sale discounts;
- option expiration and post-termination exercise windows;
- acquisition acceleration;
- future refresh grants;
- volatility or probability weighting.

The methodology section explains these boundaries in plain language. The disclaimer is compact and adjacent to the results rather than a long unrelated block below the product.

## Visual Language

### Personality

The product is:

- clear;
- honest;
- human;
- quietly optimistic.

It should feel like a beautifully edited decision tool, not a generic fintech dashboard.

### Typography

Use an editorial serif for the primary question and large calculated values. Use a compact sans serif for controls, explanations, labels, and tabular metrics.

Typography must:

- use tabular numerals for changing values;
- avoid oversized numbers that wrap or overflow at 320 CSS pixels;
- maintain a clear hierarchy in both themes;
- load through `next/font` with no render-blocking external stylesheet.

### Palette

The light-theme foundation is:

- warm paper: `#F4F1E8`;
- surface: `#FFFDF8`;
- deep ink: `#18251E`;
- outcome green: `#1F7A52`;
- soft sage: `#DCECDF`;
- cost coral: `#DF7253`;
- attention gold: `#D5A538`.

Dark-theme tokens use the same semantic roles, with adjusted luminance rather than mechanically inverted colors.

Color never carries meaning alone. Icons, labels, line styles, or patterns reinforce chart and validation states.

### Shape and Motion

- Cards use fine borders, restrained shadows, and soft 12–18 pixel radii.
- Chips and segmented controls use pill geometry because selection is their main affordance.
- Avoid glass blur, neon gradients, and decorative emoji indicators.
- Value changes and chart transitions use 180–240 millisecond motion.
- `prefers-reduced-motion` removes nonessential motion.

## Component and Data Boundaries

The implementation is split into units with one clear responsibility:

- **scenario schema:** coercion and validation;
- **preset catalog:** immutable preset data and matching;
- **calculation engine:** raw current/exit calculations;
- **timeline generator:** quarterly points and event markers;
- **formatters:** currency, compact currency, shares, and ownership;
- **scenario state:** active scenario, mode changes, reset, and comparisons;
- **mode switch:** semantic workflow selection;
- **scenario chips:** preset selection and custom-state display;
- **result summary:** headline and supporting metrics;
- **timeline chart:** visualization plus accessible text summary;
- **assumptions editor:** essential and advanced fields;
- **comparison tray/table:** snapshots and three-scenario limit;
- **methodology/disclaimer:** calculation boundaries.

The calculation engine and timeline generator have no React dependency. Components receive typed data and callbacks rather than importing unrelated state.

## Input and Error Behavior

- Empty numeric fields remain editable and do not immediately snap to a fallback.
- Validation runs as the user leaves a field and while a previously invalid field is corrected.
- While an input is incomplete, the interface preserves the last valid result and marks it as based on the previous valid assumptions.
- Zero is accepted only where it has a defined meaning.
- Grant shares, total company shares, company values, vesting duration, and exit timing must be positive.
- Vested shares cannot exceed grant shares.
- Cliff months cannot exceed vesting months.
- Dilution may be 0% and must remain below 100%.
- Exit timing cannot exceed 15 years.
- Funding rounds must be a whole number from 0 through 10.
- Invalid input text and validation messages are associated with their controls.
- Unexpected calculation failures fall back to a calm result-panel error with a reset action. The rest of the page remains usable.

## Accessibility

The finished experience must include:

- semantic headings and regions;
- explicit labels and descriptions for every input;
- keyboard-operable mode and scenario selection;
- at least 44 by 44 CSS pixel touch targets for primary mobile controls;
- visible focus states in light and dark themes;
- no page-level horizontal scrolling at 320, 375, 390, 768, 1024, or 1440 CSS pixels;
- a chart text summary and keyboard-accessible data exploration;
- screen-reader announcements for preset changes and comparison-limit feedback;
- AA contrast for text, controls, focus indicators, and meaningful chart elements;
- reduced-motion behavior.

## Dependency Modernization

Use Bun as the canonical package manager because the repository already contains `bun.lock`.

During implementation:

- upgrade every direct runtime and development dependency to the latest mutually compatible stable release available on July 31, 2026;
- move the application to the Next.js 16 and React 19.2 generation;
- migrate removed framework commands such as `next lint` to supported equivalents;
- adopt current flat ESLint configuration;
- remove unused runtime dependencies and dead UI components;
- add only the minimum packages needed for the chart and automated tests;
- regenerate `bun.lock`;
- accept no unresolved peer-dependency warnings;
- document any package that cannot use its latest release and the exact compatibility reason.

Compatibility exception discovered during implementation:

- TypeScript is pinned to `6.0.3` instead of `7.0.2` because the `typescript-eslint` version bundled with `eslint-config-next@16.2.12` explicitly rejects the TypeScript 7 API. The pin should be revisited when Next.js ships a TypeScript 7-compatible ESLint stack.
- ESLint is pinned to `9.39.5` instead of `10.8.0` because the React ESLint plugin bundled with `eslint-config-next@16.2.12` calls a context API removed in ESLint 10. The pin should be revisited with the same Next.js ESLint-stack upgrade.

The globally installed Vercel CLI is outside the repository dependency graph and should be upgraded separately from `56.2.1` to the current release with:

```bash
npm i -g vercel@latest
```

## Testing and Verification

### Calculation Tests

Unit tests cover:

- suffix-free numeric input boundaries;
- ownership before and after dilution;
- zero-round dilution;
- new-offer cliff behavior immediately before, at, and after the cliff;
- existing-equity vesting growth;
- exits before full vesting;
- negative net value;
- multiple-round dilution;
- quarterly timeline endpoints and event markers;
- preset matching and transition to `Custom`.

### Component Tests

Interaction tests cover:

- changing modes while preserving compatible values;
- selecting and editing presets;
- validation and last-valid-result behavior;
- saving, renaming, selecting, and removing comparisons;
- the three-scenario limit;
- chart summary content;
- keyboard operation of chips and segmented controls.

### Build and Static Verification

The repository must pass:

- unit and component tests;
- TypeScript checking;
- ESLint;
- a production Next.js build;
- a dependency-outdated check;
- a clean browser console during verified flows.

### Browser Verification

Real-browser checks cover:

- light and dark themes;
- 390 by 844 mobile viewport;
- 768 pixel tablet viewport;
- 1440 pixel desktop viewport;
- scenario selection;
- essential-input editing;
- mode switching;
- comparison creation and removal;
- chart tooltip/data exploration;
- reduced motion;
- no horizontal overflow.

Screenshots are reviewed at mobile and desktop widths before completion.

## Out of Scope

This redesign does not add:

- authentication or user accounts;
- server persistence or cloud sync;
- shareable scenario links;
- tax calculations;
- liquidation-preference modeling;
- live company or market data;
- personalized financial advice;
- telemetry or an external analytics service.

## Success Criteria

The redesign is complete when:

1. a first-time mobile user can select a scenario and see an interpretable result without traversing the full form;
2. all approved functional and visual behaviors are implemented;
3. current, exit, and timeline values all derive from the same typed calculation model;
4. comparison behavior works for up to three scenarios;
5. the app remains usable and legible at all target viewports in light and dark themes;
6. automated tests and production verification pass;
7. all direct dependencies are current or have a documented compatibility exception;
8. the browser console is clean in the verified user flows.
