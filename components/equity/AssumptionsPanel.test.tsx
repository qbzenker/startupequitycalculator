import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EquityStudio } from "./EquityStudio";

describe("AssumptionsPanel", () => {
  it("maps each assumption to its semantic control", () => {
    render(<EquityStudio />);

    expect(
      screen.getByRole("heading", { name: "Your grant" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What happens next" }),
    ).toBeInTheDocument();

    const exitChoices = screen.getByRole("group", {
      name: "Time to exit common values",
    });
    expect(
      within(exitChoices).getByRole("button", { name: "4 years" }),
    ).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByRole("button", {
        name: "Decrease future funding rounds",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Increase future funding rounds",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", {
        name: "Adjust dilution per round",
      }),
    ).toHaveValue("18");
  });
});
