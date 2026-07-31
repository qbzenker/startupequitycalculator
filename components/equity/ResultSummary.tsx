"use client";

import {
  formatCompactCurrency,
  formatCurrency,
  formatOwnership,
} from "@/lib/equity/format";
import type {
  EquityResult,
  EquityScenarioInput,
} from "@/lib/equity/types";

interface ResultSummaryProps {
  input: EquityScenarioInput;
  result: EquityResult;
  isStale: boolean;
  error?: string;
  onReset?: () => void;
}

export function ResultSummary({
  input,
  result,
  isStale,
  error,
  onReset,
}: ResultSummaryProps) {
  if (error) {
    return (
      <section
        className="result-panel result-panel-error"
        aria-labelledby="result-title"
      >
        <p className="eyebrow">The model paused safely</p>
        <h2 id="result-title">We couldn&apos;t model this scenario</h2>
        <p className="result-error-copy">{error}</p>
        <button type="button" className="primary-button" onClick={onReset}>
          Reset scenario
        </button>
      </section>
    );
  }

  const hasNegativeOutcome = result.exitNetValue < 0;

  return (
    <section
      className={`result-panel${hasNegativeOutcome ? " result-panel-negative" : ""}`}
      aria-labelledby="result-title"
    >
      <div className="result-heading">
        <div>
          <p className="eyebrow">Your modeled outcome</p>
          <h2 id="result-title">Potential net value at exit</h2>
        </div>
        <span className="result-horizon">
          {input.exitMonths} month horizon
        </span>
      </div>

      <p className="headline-value">
        {formatCompactCurrency(result.exitNetValue)}
        <span className="sr-only">
          {" "}
          Exact value: {formatCurrency(result.exitNetValue)}.
        </span>
      </p>
      <p className="result-caption">
        At exit, after the modeled exercise cost and future dilution.
      </p>

      {hasNegativeOutcome ? (
        <p className="negative-outcome-note">
          In this scenario, exercising costs more than the modeled shares
          are worth.
        </p>
      ) : null}

      <dl className="result-metrics">
        <div>
          <dt>Current vested net</dt>
          <dd>{formatCurrency(result.currentNetValue)}</dd>
        </div>
        <div>
          <dt>Exercise at exit</dt>
          <dd>{formatCurrency(result.exitExerciseCost)}</dd>
        </div>
        <div>
          <dt>Ownership at exit</dt>
          <dd>{formatOwnership(result.ownershipAtExit)}</dd>
        </div>
      </dl>

      {isStale ? (
        <p className="stale-result-note">
          Results use your last valid assumptions.
        </p>
      ) : null}
    </section>
  );
}
