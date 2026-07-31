"use client";

import { formatCompactCurrency } from "@/lib/equity/format";

import { AssumptionsPanel } from "./AssumptionsPanel";
import { ModeSwitch } from "./ModeSwitch";
import { ScenarioChips } from "./ScenarioChips";
import { useEquityStudio } from "./useEquityStudio";

export function EquityStudio() {
  const studio = useEquityStudio();
  const mode = studio.watched.mode ?? studio.validInput.mode;

  return (
    <div className="equity-studio">
      <div className="studio-intro">
        <ModeSwitch value={mode} onChange={studio.setMode} />
        <div>
          <p className="eyebrow">A clearer way to read the fine print</p>
          <h1>What could your startup equity become?</h1>
          <p className="intro-copy">
            Model the upside, the dilution, and what it may cost to own.
          </p>
        </div>
        <ScenarioChips
          activeId={studio.activePreset?.id}
          onSelect={studio.selectPreset}
        />
      </div>

      <div className="studio-workspace">
        <section className="result-panel" aria-labelledby="result-title">
          <p className="eyebrow">Your modeled outcome</p>
          <h2 id="result-title">Potential net value at exit</h2>
          <output className="headline-value">
            {formatCompactCurrency(studio.result.exitNetValue)}
          </output>
          <p>
            At exit, after the modeled exercise cost and future dilution.
          </p>
          {studio.isUsingPreviousResult ? (
            <p className="stale-result-note">
              Results use your last valid assumptions.
            </p>
          ) : null}
        </section>

        <AssumptionsPanel
          form={studio.form}
          issues={studio.issues}
          onFieldChange={studio.updateLastValidField}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {studio.activePreset
          ? `${studio.activePreset.label} scenario selected.`
          : "Custom scenario selected."}
      </p>
    </div>
  );
}
