import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { calculateEquity } from "@/lib/equity/calculate";
import { DEFAULT_PRESET } from "@/lib/equity/presets";

import { ResultSummary } from "./ResultSummary";

describe("ResultSummary", () => {
  it("shows a calm recoverable state after an unexpected calculation error", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <ResultSummary
        input={DEFAULT_PRESET.input}
        result={calculateEquity(DEFAULT_PRESET.input)}
        isStale={false}
        error="We couldn't model these assumptions safely."
        onReset={onReset}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "We couldn't model this scenario",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset scenario" }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
