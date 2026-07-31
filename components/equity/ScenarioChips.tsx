"use client";

import { PRESETS } from "@/lib/equity/presets";
import type { ScenarioPreset } from "@/lib/equity/types";

interface ScenarioChipsProps {
  activeId?: ScenarioPreset["id"];
  onSelect: (id: ScenarioPreset["id"]) => void;
}

export function ScenarioChips({
  activeId,
  onSelect,
}: ScenarioChipsProps) {
  return (
    <div className="scenario-strip" aria-label="Starting scenarios">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          className="scenario-chip"
          aria-pressed={activeId === preset.id}
          onClick={() => onSelect(preset.id)}
        >
          <span>{preset.label}</span>
          <small>{preset.description}</small>
        </button>
      ))}
      {activeId ? null : (
        <button
          type="button"
          className="scenario-chip"
          aria-pressed="true"
          disabled
        >
          Custom scenario
        </button>
      )}
    </div>
  );
}
