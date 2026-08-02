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

  it("groups company values with one shared explanation", () => {
    const { container } = render(<EquityStudio />);

    const help = screen.getByText(
      "Use full dollars or shorthand like 120m and 1.5b.",
    );
    const current = screen.getByLabelText("Company value today");
    const exit = screen.getByLabelText("Potential exit value");
    const grid = container.querySelector(".company-value-grid");

    expect(grid).not.toBeNull();
    expect(grid).toContainElement(current);
    expect(grid).toContainElement(exit);
    expect(
      screen.getAllByText(
        "Use full dollars or shorthand like 120m and 1.5b.",
      ),
    ).toHaveLength(1);
    expect(current.getAttribute("aria-describedby")).toContain(help.id);
    expect(exit.getAttribute("aria-describedby")).toContain(help.id);
  });

  it("explains assumption updates directly", () => {
    const { container } = render(<EquityStudio />);

    expect(
      screen.getByText(
        "Change any assumption. Results and charts update together.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Adjust the story. Keep the math honest."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("MODEL 01")).not.toBeInTheDocument();
    expect(container.querySelector(".intro-note")).not.toBeInTheDocument();
  });
});
