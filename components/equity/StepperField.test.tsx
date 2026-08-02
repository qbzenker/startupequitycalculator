import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StepperField } from "./StepperField";

describe("StepperField", () => {
  it("changes a discrete value by one in either direction", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <StepperField
        id="fundingRounds"
        label="Future funding rounds"
        value={2}
        stableValue={2}
        min={0}
        max={10}
        step={1}
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Increase future funding rounds",
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith(3);

    await user.click(
      screen.getByRole("button", {
        name: "Decrease future funding rounds",
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("disables the decrease action at zero", () => {
    render(
      <StepperField
        id="fundingRounds"
        label="Future funding rounds"
        value={0}
        stableValue={0}
        min={0}
        max={10}
        step={1}
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Decrease future funding rounds",
      }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Future funding rounds")).toHaveValue("0");
  });

  it("disables the increase action at the upper boundary", () => {
    render(
      <StepperField
        id="fundingRounds"
        label="Future funding rounds"
        value={10}
        stableValue={10}
        min={0}
        max={10}
        step={1}
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Increase future funding rounds",
      }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Future funding rounds")).toHaveValue("10");
  });

  it("uses the stable value for a button action while the draft is empty", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <StepperField
        id="fundingRounds"
        label="Future funding rounds"
        value={null}
        stableValue={4}
        min={0}
        max={10}
        step={1}
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Increase future funding rounds",
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it("associates validation feedback with direct entry", () => {
    render(
      <StepperField
        id="fundingRounds"
        label="Future funding rounds"
        value={null}
        stableValue={2}
        min={0}
        max={10}
        step={1}
        error="Use a whole number of rounds"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Future funding rounds");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Use a whole number of rounds");
  });
});
