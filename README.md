# Equity, decoded.

A mobile-first scenario studio for understanding a startup equity grant. It
turns the headline percentage into a fuller picture: vesting, dilution,
exercise cost, ownership at exit, and potential pre-tax value over time.

## What it models

- **New offers and existing equity.** Start from a proposed grant or include
  shares that have already vested.
- **Useful starting scenarios.** Try Early employee, Series A typical, Growth
  stage, or Conservative case, then edit any assumption.
- **Vesting over time.** New grants model a cliff followed by linear vesting;
  existing grants model the remaining unvested balance.
- **Future dilution.** Financing rounds are distributed across the selected
  time horizon and reduce ownership by the chosen percentage per round.
- **Exercise cost and net value.** Gross equity value and exercise cost are
  modeled separately so negative outcomes remain visible.
- **Scenario comparison.** Keep the active scenario beside as many as two
  named snapshots and compare their curves and exit outcomes.
- **Accessible chart context.** Every chart includes milestone markers and an
  equivalent written summary for its current and exit endpoints.
- **Fast, exact assumptions.** Common time horizons are one tap away, funding
  rounds use a bounded stepper, dilution is directly explorable, and company
  values accept full dollars or shorthand such as `120m` and `1.5b`.

## Model boundaries

This is an educational, pre-tax estimate—not a valuation, forecast, or
financial recommendation. It excludes liquidation preferences, taxes,
transaction costs, secondary-sale discounts, changing exercise windows, and
the many rights that can differ by security and financing agreement.

Company value is interpolated between the current and exit assumptions for
visualization. Financing rounds are evenly spaced across the time horizon.
Real company value and financing events do not behave this smoothly.

## Development

The project uses [Bun](https://bun.sh/) and Next.js App Router.

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality commands:

```bash
bun run test:run   # Vitest unit and component tests
bun run lint       # Next.js ESLint rules
bun run typecheck  # TypeScript without emitting files
bun run build      # Production Next.js build
bun run check      # All four gates in sequence
```

## Dependency policy

Direct dependencies are pinned to the newest mutually compatible stable
versions reviewed on July 31, 2026. Two development-tool exceptions are
intentional:

- TypeScript is pinned to `6.0.3`; TypeScript `7.0.2` is not yet supported by
  the `typescript-eslint` version bundled with `eslint-config-next@16.2.12`.
- ESLint is pinned to the latest v9 release, `9.39.5`; ESLint `10.8.0` removes
  context APIs still used by the React lint plugin bundled with
  `eslint-config-next@16.2.12`.

## Contributing

Run `bun run check` before opening a pull request. Calculation changes should
begin with focused tests under `lib/equity`; interaction changes should extend
`components/equity/EquityStudio.test.tsx`.

MIT licensed. Contributions and careful critiques of the model are welcome.
