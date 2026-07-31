import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EquityStudio } from "./EquityStudio";

describe("EquityStudio", () => {
  it("presents one clear title, theme control, and model boundaries", () => {
    render(<EquityStudio />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Toggle color theme" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("How this model works"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pre-tax estimate and excludes liquidation preferences/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/hypothetical millions into actual anxiety/i),
    ).not.toBeInTheDocument();
  });

  it("starts with the Series A new-offer result before the assumptions", () => {
    render(<EquityStudio />);

    expect(
      screen.getByRole("button", { name: "New offer" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /Series A · typical/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Grant size")).toHaveValue("20,000");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    const resultHeading = screen.getByRole("heading", {
      name: "Potential net value at exit",
    });
    const assumptionsHeading = screen.getByRole("heading", {
      name: "Your assumptions",
    });

    expect(
      resultHeading.compareDocumentPosition(assumptionsHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("selects a preset and updates its values", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(
      screen.getByRole("button", { name: /Growth stage/ }),
    );

    expect(screen.getByLabelText("Grant size")).toHaveValue("8,000");
    expect(
      screen.getByRole("button", { name: /Growth stage/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("labels an edited preset as Custom", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    const grant = screen.getByLabelText("Grant size");
    await user.clear(grant);
    await user.type(grant, "21000");

    expect(
      screen.getByRole("button", { name: "Custom scenario" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("preserves compatible values when switching to existing equity", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(
      screen.getByRole("button", { name: "Existing equity" }),
    );

    expect(screen.getByLabelText("Grant size")).toHaveValue("20,000");
    expect(screen.getByLabelText("Vested shares today")).toHaveValue("0");
    expect(
      screen.getByRole("button", { name: "Existing equity" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the last valid result while a field is incomplete", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    expect(screen.getByText("$983.6K")).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Grant size"));

    expect(
      screen.getByText("Results use your last valid assumptions."),
    ).toBeInTheDocument();
    expect(screen.getByText("$983.6K")).toBeInTheDocument();
  });

  it("uses the reset scenario as the next last-valid result", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(
      screen.getByRole("button", { name: /Growth stage/ }),
    );
    expect(screen.getByText("$228K")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await user.clear(screen.getByLabelText("Grant size"));

    expect(screen.getByText("$983.6K")).toBeInTheDocument();
  });

  it("associates invalid existing-equity feedback with its field", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(
      screen.getByRole("button", { name: "Existing equity" }),
    );
    const vested = screen.getByLabelText("Vested shares today");
    await user.clear(vested);
    await user.type(vested, "25000");
    await user.tab();

    expect(vested).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("Vested shares cannot exceed the grant"),
    ).toBeInTheDocument();
  });

  it("supports keyboard selection of a scenario chip", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    const earlyEmployee = screen.getByRole("button", {
      name: /Early employee/,
    });
    earlyEmployee.focus();
    await user.keyboard("{Enter}");

    expect(earlyEmployee).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Grant size")).toHaveValue("40,000");
  });

  it("shows the headline result with decision-relevant supporting metrics", () => {
    render(<EquityStudio />);

    const result = screen.getByRole("region", {
      name: "Potential net value at exit",
    });

    expect(within(result).getByText("$983.6K")).toBeInTheDocument();
    expect(within(result).getByText("$25,000")).toBeInTheDocument();
    expect(within(result).getByText("0.067%")).toBeInTheDocument();
    expect(within(result).getByText("Current vested net")).toBeInTheDocument();
    expect(within(result).getByText("Exercise at exit")).toBeInTheDocument();
    expect(within(result).getByText("Ownership at exit")).toBeInTheDocument();
  });

  it("keeps negative outcomes visible and explains them", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    const strikePrice = screen.getByLabelText("Strike price");
    await user.clear(strikePrice);
    await user.type(strikePrice, "100");

    const exitValue = screen.getByLabelText("Potential exit value");
    await user.clear(exitValue);
    await user.type(exitValue, "1000000");

    const rounds = screen.getByLabelText("Future funding rounds");
    await user.clear(rounds);
    await user.type(rounds, "0");

    expect(screen.getByText("-$2M")).toBeInTheDocument();
    expect(
      screen.getByText(
        "In this scenario, exercising costs more than the modeled shares are worth.",
      ),
    ).toBeInTheDocument();
  });

  it("provides an accessible chart and equivalent endpoint summary", () => {
    render(<EquityStudio />);

    expect(
      screen.getByRole("img", { name: "Equity value over time" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Today: 0 vested shares and $0 net value."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "At exit: 20,000 vested shares, 0.067% ownership, $25,000 exercise cost, and $983,600 net value.",
      ),
    ).toBeInTheDocument();
  });

  it("saves, renames, loads, and removes comparison snapshots", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(
      screen.getByRole("button", { name: "Compare this scenario" }),
    );
    expect(screen.getByLabelText("Rename Baseline")).toBeInTheDocument();

    const exitValue = screen.getByLabelText("Potential exit value");
    await user.clear(exitValue);
    await user.type(exitValue, "2000000000");
    await user.click(
      screen.getByRole("button", { name: "Compare this scenario" }),
    );
    expect(screen.getByLabelText("Rename Scenario 2")).toBeInTheDocument();

    const baselineName = screen.getByLabelText("Rename Baseline");
    await user.clear(baselineName);
    await user.type(baselineName, "Downside");
    await user.tab();
    expect(screen.getByLabelText("Rename Downside")).toHaveValue("Downside");

    await user.click(
      screen.getByRole("button", { name: "Load Downside" }),
    );
    expect(screen.getByLabelText("Potential exit value")).toHaveValue(
      "$1,500,000,000",
    );

    await user.click(
      screen.getByRole("button", { name: "Remove Scenario 2" }),
    );
    expect(
      screen.queryByLabelText("Rename Scenario 2"),
    ).not.toBeInTheDocument();
  });

  it("announces the three-visible-scenario limit", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);
    const compare = screen.getByRole("button", {
      name: "Compare this scenario",
    });

    await user.click(compare);
    await user.click(compare);
    await user.click(compare);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Two snapshots are already saved. Remove one before saving the active scenario again.",
    );
  });
});
