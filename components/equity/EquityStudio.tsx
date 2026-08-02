"use client";

import { AssumptionsPanel } from "./AssumptionsPanel";
import { ComparisonTray } from "./ComparisonTray";
import { EquityTimeline } from "./EquityTimeline";
import { Methodology } from "./Methodology";
import { MobileAssumptionSummary } from "./MobileAssumptionSummary";
import { ResultSummary } from "./ResultSummary";
import { ScenarioChips } from "./ScenarioChips";
import { StudioHeader } from "./StudioHeader";
import { useEquityStudio } from "./useEquityStudio";

export function EquityStudio() {
  const studio = useEquityStudio();
  const mode = studio.watched.mode ?? studio.validInput.mode;

  return (
    <div className="equity-studio">
      <StudioHeader mode={mode} onModeChange={studio.setMode} />

      <div className="studio-intro">
        <div className="intro-heading">
          <p className="eyebrow">A clearer way to read the fine print</p>
          <h1>What could your startup equity become?</h1>
          <p className="intro-copy">
            See the upside, the dilution, and what it may cost to own—before
            one optimistic number makes the decision for you.
          </p>
        </div>
        <div className="intro-note" aria-hidden="true">
          <span>Model</span>
          <strong>01</strong>
          <small>Adjust the story. Keep the math honest.</small>
        </div>
        <ScenarioChips
          activeId={studio.activePreset?.id}
          onSelect={studio.selectPreset}
        />
      </div>

      <div className="studio-workspace">
        <div className="outcome-column">
          <ResultSummary
            input={studio.validInput}
            result={studio.result}
            isStale={studio.isUsingPreviousResult}
            error={studio.calculationError}
            onReset={studio.resetScenario}
          />
          {studio.calculationError ? null : (
            <EquityTimeline
              active={studio.activeScenario}
              comparisons={studio.savedScenarios}
              events={studio.timeline.events}
            />
          )}
          <MobileAssumptionSummary input={studio.validInput} />
        </div>

        <AssumptionsPanel
          form={studio.form}
          stableInput={studio.validInput}
          issues={studio.issues}
          onReset={studio.resetScenario}
          onFieldChange={studio.updateLastValidField}
        />
      </div>

      <ComparisonTray
        active={studio.activeScenario}
        saved={studio.savedScenarios}
        message={studio.comparisonMessage}
        onSave={studio.saveActiveScenario}
        onRename={studio.renameSavedScenario}
        onRemove={studio.removeSavedScenario}
        onLoad={studio.loadSavedScenario}
      />

      <Methodology />

      <p className="sr-only" aria-live="polite">
        {studio.activePreset
          ? `${studio.activePreset.label} scenario selected.`
          : "Custom scenario selected."}
      </p>
    </div>
  );
}
