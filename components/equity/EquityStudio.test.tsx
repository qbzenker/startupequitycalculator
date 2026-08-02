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

  it("uses supported semantics for labeled visual groups", () => {
    const { container } = render(<EquityStudio />);

    expect(
      screen.getByRole("group", { name: "Starting scenarios" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Chart legend" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".brand-lockup")).not.toHaveAttribute(
      "aria-label",
    );
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
    const grant = screen.getByLabelText("Grant size");
    await user.clear(grant);
    await user.type(grant, "10000");
    await user.tab();
    const vested = screen.getByLabelText("Vested shares today");
    await user.clear(vested);
    await user.type(vested, "25000");
    await user.tab();

    expect(vested).toHaveAttribute("aria-invalid", "true");
    const error = screen.getByText(
      "Vested shares cannot exceed the grant",
    );
    expect(error).toBeInTheDocument();
    expect(vested.getAttribute("aria-describedby")).toContain(error.id);
    expect(grant).toHaveAttribute("aria-invalid", "false");
    expect(
      screen.getAllByText("Vested shares cannot exceed the grant"),
    ).toHaveLength(1);
  });

  it("associates a cliff relationship error with a touched vesting term", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(screen.getByText("Vesting details"));
    const vesting = screen.getByLabelText("Total vesting term");
    await user.clear(vesting);
    await user.type(vesting, "6");
    await user.tab();

    const error = screen.getByText(
      "Cliff cannot be longer than the vesting term",
    );
    expect(
      screen.getByText("Results use your last valid assumptions."),
    ).toBeInTheDocument();
    expect(vesting).toHaveAttribute("aria-invalid", "true");
    expect(vesting.getAttribute("aria-describedby")).toContain(error.id);
    expect(screen.getByLabelText("Vesting cliff")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  it("keeps a cliff relationship error on the touched cliff", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(screen.getByText("Vesting details"));
    const vesting = screen.getByLabelText("Total vesting term");
    await user.clear(vesting);
    await user.type(vesting, "36");
    await user.tab();
    const cliff = screen.getByLabelText("Vesting cliff");
    await user.clear(cliff);
    await user.type(cliff, "60");
    await user.tab();

    const error = screen.getByText(
      "Cliff cannot be longer than the vesting term",
    );
    expect(
      screen.getByText("Results use your last valid assumptions."),
    ).toBeInTheDocument();
    expect(cliff).toHaveAttribute("aria-invalid", "true");
    expect(cliff.getAttribute("aria-describedby")).toContain(error.id);
    expect(vesting).toHaveAttribute("aria-invalid", "false");
    expect(
      screen.getAllByText(
        "Cliff cannot be longer than the vesting term",
      ),
    ).toHaveLength(1);
  });

  it("associates a vested-shares relationship error with a touched grant", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(
      screen.getByRole("button", { name: "Existing equity" }),
    );
    await user.click(screen.getByText("Vesting details"));
    const vested = screen.getByLabelText("Vested shares today");
    await user.clear(vested);
    await user.type(vested, "15000");
    await user.tab();
    await user.click(
      screen.getByRole("button", { name: "Compare this scenario" }),
    );
    await user.click(screen.getByRole("button", { name: "Load Baseline" }));

    const grant = screen.getByLabelText("Grant size");
    await user.clear(grant);
    await user.type(grant, "10000");
    await user.tab();

    const error = screen.getByText(
      "Vested shares cannot exceed the grant",
    );
    expect(
      screen.getByText("Results use your last valid assumptions."),
    ).toBeInTheDocument();
    expect(grant).toHaveAttribute("aria-invalid", "true");
    expect(grant.getAttribute("aria-describedby")).toContain(error.id);
    expect(vested).toHaveAttribute("aria-invalid", "false");
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

  it("labels all five comparison metrics", () => {
    render(<EquityStudio />);

    const activeCard = screen
      .getByRole("heading", { name: "Active scenario" })
      .closest("article");

    expect(activeCard).not.toBeNull();
    const card = within(activeCard as HTMLElement);

    expect(card.getByText("Exit value")).toBeInTheDocument();
    expect(card.getByText("Dilution")).toBeInTheDocument();
    expect(card.getByText("Ownership at exit")).toBeInTheDocument();
    expect(card.getByText("Exercise cost")).toBeInTheDocument();
    expect(card.getByText("Net value")).toBeInTheDocument();
    expect(card.getByText("18% per round")).toBeInTheDocument();
    expect(card.getByText("$25,000")).toBeInTheDocument();
    expect(card.getByText("$983,600")).toBeInTheDocument();
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
      screen.getByRole("region", {
        name: "Interactive equity value over time chart",
      }),
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

  it("summarizes active assumptions between the timeline and editable form", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    const timeline = screen.getByRole("region", {
      name: "Interactive equity value over time chart",
    });
    const summary = screen.getByRole("region", {
      name: "Active assumptions",
    });
    const assumptions = screen.getByRole("heading", {
      name: "Your assumptions",
    });

    expect(summary).toHaveTextContent(
      "$1.5B exit · 48 months · 2 rounds · 18% dilution each",
    );
    expect(
      timeline.compareDocumentPosition(summary) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      summary.compareDocumentPosition(assumptions) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.click(
      within(summary).getByRole("button", { name: "Edit assumptions" }),
    );
    expect(screen.getByLabelText("Grant size")).toHaveFocus();
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

  it("keeps regenerated comparison legend and load names unique", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);
    const compare = screen.getByRole("button", {
      name: "Compare this scenario",
    });

    await user.click(compare);
    await user.click(compare);
    await user.click(
      screen.getByRole("button", { name: "Remove Baseline" }),
    );
    await user.click(compare);

    const legend = screen.getByLabelText("Chart legend");
    expect(within(legend).getByText("Baseline")).toBeInTheDocument();
    expect(within(legend).getByText("Scenario 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Load Baseline" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Load Scenario 2" }),
    ).toBeInTheDocument();
  });

  it("accepts an exact custom horizon and dilution", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    const exitMonths = screen.getByLabelText("Time to exit");
    await user.clear(exitMonths);
    await user.type(exitMonths, "43");

    const dilution = screen.getByLabelText("Dilution per round");
    await user.clear(dilution);
    await user.type(dilution, "17.5");

    expect(exitMonths).toHaveValue("43 months");
    expect(dilution).toHaveValue("17.5%");
    expect(
      screen.getByRole("button", { name: "Custom scenario" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByText("Results use your last valid assumptions."),
    ).not.toBeInTheDocument();
  });

  it("parses company value shorthand into the active scenario", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    const exitValue = screen.getByLabelText("Potential exit value");
    await user.clear(exitValue);
    await user.type(exitValue, "2b");
    await user.tab();

    expect(exitValue).toHaveValue("$2,000,000,000");
    expect(
      screen.getByRole("button", { name: "Custom scenario" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("rounds plain-dollar company values without adding cents", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    const currentValue = screen.getByLabelText("Company value today");
    await user.clear(currentValue);
    await user.type(currentValue, "12.75");
    await user.tab();

    expect(currentValue).toHaveValue("$13");
    expect(
      screen.queryByText("Results use your last valid assumptions."),
    ).not.toBeInTheDocument();
  });

  it("synchronizes semantic controls when reset restores Series A", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(
      screen.getByRole("button", {
        name: "Increase future funding rounds",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Future funding rounds")).toHaveValue("2");
    expect(
      screen.getByRole("slider", {
        name: "Adjust dilution per round",
      }),
    ).toHaveValue("18");
    expect(
      within(
        screen.getByRole("group", {
          name: "Time to exit common values",
        }),
      ).getByRole("button", { name: "4 years" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows existing-equity vesting controls in the details section", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(
      screen.getByRole("button", { name: "Existing equity" }),
    );
    await user.click(screen.getByText("Vesting details"));

    expect(screen.getByLabelText("Vested shares today")).toHaveValue("0");
    expect(
      screen.getByRole("group", {
        name: "Remaining vesting common values",
      }),
    ).toBeInTheDocument();
  });

  it("restores every semantic representation when loading a snapshot", async () => {
    const user = userEvent.setup();
    render(<EquityStudio />);

    await user.click(
      screen.getByRole("button", { name: "Compare this scenario" }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Increase future funding rounds",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Load Baseline" }),
    );

    expect(screen.getByLabelText("Future funding rounds")).toHaveValue("2");
    expect(
      screen.getByRole("slider", {
        name: "Adjust dilution per round",
      }),
    ).toHaveValue("18");
    expect(
      within(
        screen.getByRole("group", {
          name: "Time to exit common values",
        }),
      ).getByRole("button", { name: "4 years" }),
    ).toHaveAttribute("aria-pressed", "true");
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
