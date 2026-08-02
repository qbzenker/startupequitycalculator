import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("makes overflowing milestones focusable and keyboard scrollable", () => {
    const active = makeScenario("active", "Active scenario", 1_500_000_000);

    render(
      <EquityTimeline
        active={active}
        comparisons={[]}
        events={generateTimeline(active.input).events}
      />,
    );

    const rail = screen.getByRole("list", { name: "Modeled milestones" });
    expect(rail).toHaveAttribute("tabindex", "0");
    expect(rail).toHaveAccessibleDescription(
      /use left and right arrow keys to reveal later events/i,
    );

    rail.focus();
    expect(rail).toHaveFocus();
    fireEvent.keyDown(rail, { key: "ArrowRight" });
    expect(rail.scrollLeft).toBe(160);
    fireEvent.keyDown(rail, { key: "ArrowLeft" });
    expect(rail.scrollLeft).toBe(0);
  });

  it("keeps event names in the semantic milestone list, not SVG lines", () => {
    const active = makeScenario("active", "Active scenario", 1_500_000_000);
    const { container } = render(
      <EquityTimeline
        active={active}
        comparisons={[]}
        events={generateTimeline(active.input).events}
      />,
    );
    const rail = screen.getByRole("list", { name: "Modeled milestones" });

    expect(within(rail).getByText("Funding round 1")).toBeInTheDocument();
    expect(within(rail).getByText("Funding round 2")).toBeInTheDocument();
    expect(container.querySelector("line[aria-label]")).toBeNull();
  });

  it("presents fractional short-horizon milestones concisely", () => {
    const input = {
      ...DEFAULT_PRESET.input,
      exitMonths: 1,
      fundingRounds: 10,
    };
    const active: SavedScenario = {
      id: "active",
      name: "Active scenario",
      color: "#1F7A52",
      input,
      result: calculateEquity(input),
      timeline: generateTimeline(input).points,
    };

    render(
      <EquityTimeline
        active={active}
        comparisons={[]}
        events={generateTimeline(input).events}
      />,
    );

    const rail = screen.getByRole("list", { name: "Modeled milestones" });
    expect(rail).toHaveTextContent("0.1mFunding round 1");
    expect(rail).not.toHaveTextContent("0.090909");
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
