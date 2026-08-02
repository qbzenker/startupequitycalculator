import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SliderNumberField } from "./SliderNumberField";

describe("SliderNumberField", () => {
  it("synchronizes the range and exact percentage input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SliderNumberField
        id="dilutionPerRound"
        label="Dilution per round"
        sliderLabel="Adjust dilution per round"
        value={18}
        stableValue={18}
        min={0}
        max={99.9}
        step={0.1}
        suffix="%"
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    const slider = screen.getByRole("slider", {
      name: "Adjust dilution per round",
    });
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "99.9");
    expect(slider).toHaveAttribute("step", "0.1");
    expect(slider).toHaveAttribute("aria-valuetext", "18%");

    fireEvent.change(slider, { target: { value: "17.5" } });
    expect(onChange).toHaveBeenLastCalledWith(17.5);

    const exact = screen.getByLabelText("Dilution per round");
    await user.clear(exact);
    await user.type(exact, "19.3");
    expect(onChange).toHaveBeenLastCalledWith(19.3);
  });

  it("associates validation feedback with the exact percentage", () => {
    render(
      <SliderNumberField
        id="dilutionPerRound"
        label="Dilution per round"
        sliderLabel="Adjust dilution per round"
        value={null}
        stableValue={18}
        min={0}
        max={99.9}
        step={0.1}
        suffix="%"
        error="Dilution must be below 100%"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Dilution per round");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Dilution must be below 100%");
  });
});
