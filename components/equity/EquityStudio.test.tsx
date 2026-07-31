import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EquityStudio } from "./EquityStudio";

describe("EquityStudio", () => {
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
});
