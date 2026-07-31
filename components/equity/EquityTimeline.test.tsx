import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { calculateEquity } from "@/lib/equity/calculate";
import { DEFAULT_PRESET } from "@/lib/equity/presets";
import { generateTimeline } from "@/lib/equity/timeline";
import type { SavedScenario } from "@/lib/equity/types";

import {
  EquityTimeline,
  TimelineTooltipContent,
} from "./EquityTimeline";

function makeScenario(
  id: string,
  name: string,
  exitCompanyValue: number,
): SavedScenario {
  const input = { ...DEFAULT_PRESET.input, exitCompanyValue };

  return {
    id,
    name,
    color: "#DF7253",
    input,
    result: calculateEquity(input),
    timeline: generateTimeline(input).points,
  };
}

describe("EquityTimeline", () => {
  it("provides keyboard exploration guidance and named comparison legends", () => {
    const active = makeScenario("active", "Active scenario", 1_500_000_000);
    const baseline = makeScenario("saved-1", "Baseline", 800_000_000);

    render(
      <EquityTimeline
        active={active}
        comparisons={[baseline]}
        events={generateTimeline(active.input).events}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Interactive equity value over time chart",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Use arrow keys to explore/i)).toBeInTheDocument();
    expect(screen.getByText("Baseline")).toBeInTheDocument();
  });
});

describe("TimelineTooltipContent", () => {
  it("explains every decision-relevant value at the active point", () => {
    render(
      <TimelineTooltipContent
        active
        label={24}
        payload={[
          {
            payload: {
              month: 24,
              active: 290_000,
              exercise: 10_000,
              vestedShares: 15_000,
              ownership: 0.00048,
              companyValue: 600_000_000,
              grossValue: 300_000,
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("Month 24")).toBeInTheDocument();
    expect(screen.getByText("15,000")).toBeInTheDocument();
    expect(screen.getByText("0.048%")).toBeInTheDocument();
    expect(screen.getByText("$600,000,000")).toBeInTheDocument();
    expect(screen.getByText("$300,000")).toBeInTheDocument();
    expect(screen.getByText("$10,000")).toBeInTheDocument();
    expect(screen.getByText("$290,000")).toBeInTheDocument();
  });
});
