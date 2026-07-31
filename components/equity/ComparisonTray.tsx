"use client";

import {
  formatCurrency,
  formatOwnership,
} from "@/lib/equity/format";
import type { SavedScenario } from "@/lib/equity/types";

interface ComparisonTrayProps {
  active: SavedScenario;
  saved: SavedScenario[];
  message: string;
  onSave: () => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onLoad: (id: string) => void;
}

function ScenarioCard({
  scenario,
  isActive = false,
  onRename,
  onRemove,
  onLoad,
}: {
  scenario: SavedScenario;
  isActive?: boolean;
  onRename?: (id: string, name: string) => void;
  onRemove?: (id: string) => void;
  onLoad?: (id: string) => void;
}) {
  return (
    <article
      className={`comparison-card${isActive ? " comparison-card-active" : ""}`}
      style={{ "--scenario-color": scenario.color } as React.CSSProperties}
    >
      <div className="comparison-card-heading">
        {isActive ? (
          <h3>Active scenario</h3>
        ) : (
          <input
            key={`${scenario.id}-${scenario.name}`}
            className="scenario-name-input"
            aria-label={`Rename ${scenario.name}`}
            defaultValue={scenario.name}
            onBlur={(event) => onRename?.(scenario.id, event.target.value)}
          />
        )}
        <span>{formatCurrency(scenario.result.exitNetValue)}</span>
      </div>

      <dl>
        <div>
          <dt>Exit value</dt>
          <dd>{formatCurrency(scenario.input.exitCompanyValue)}</dd>
        </div>
        <div>
          <dt>Ownership</dt>
          <dd>{formatOwnership(scenario.result.ownershipAtExit)}</dd>
        </div>
      </dl>

      {!isActive ? (
        <div className="comparison-card-actions">
          <button type="button" onClick={() => onLoad?.(scenario.id)}>
            Load {scenario.name}
          </button>
          <button type="button" onClick={() => onRemove?.(scenario.id)}>
            Remove {scenario.name}
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function ComparisonTray({
  active,
  saved,
  message,
  onSave,
  onRename,
  onRemove,
  onLoad,
}: ComparisonTrayProps) {
  return (
    <section
      className="comparison-panel"
      aria-labelledby="comparison-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Stress-test the offer</p>
          <h2 id="comparison-title">Compare scenarios</h2>
          <p>
            Keep up to two snapshots beside the assumptions you are editing.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={onSave}>
          Compare this scenario
        </button>
      </div>

      <p className="comparison-status" role="status">
        {message}
      </p>

      <div className="comparison-grid">
        <ScenarioCard scenario={active} isActive />
        {saved.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onRename={onRename}
            onRemove={onRemove}
            onLoad={onLoad}
          />
        ))}
      </div>
    </section>
  );
}
