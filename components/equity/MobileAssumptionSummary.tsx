"use client";

import { formatCompactCurrency } from "@/lib/equity/format";
import type { EquityScenarioInput } from "@/lib/equity/types";

interface MobileAssumptionSummaryProps {
  input: EquityScenarioInput;
}

export function MobileAssumptionSummary({
  input,
}: MobileAssumptionSummaryProps) {
  const roundLabel =
    input.fundingRounds === 1 ? "1 round" : `${input.fundingRounds} rounds`;

  function focusAssumptions() {
    document.getElementById("grantShares")?.focus();
  }

  return (
    <section
      className="mobile-assumption-summary"
      aria-label="Active assumptions"
    >
      <div>
        <p className="eyebrow">Active assumptions</p>
        <p className="mobile-assumption-copy">
          {formatCompactCurrency(input.exitCompanyValue)} exit {" · "}
          {input.exitMonths} months {" · "}
          {roundLabel} {" · "}
          {input.dilutionPerRound}% dilution each
        </p>
      </div>
      <button
        type="button"
        className="text-button"
        onClick={focusAssumptions}
      >
        Edit assumptions
      </button>
    </section>
  );
}
