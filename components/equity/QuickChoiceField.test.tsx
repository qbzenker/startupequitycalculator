import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QuickChoiceField } from "./QuickChoiceField";

const choices = [
  { label: "2 years", value: 24 },
  { label: "3 years", value: 36 },
  { label: "4 years", value: 48 },
  { label: "5 years", value: 60 },
];

describe("QuickChoiceField", () => {
  it("emits a quick choice and marks the matching value pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <QuickChoiceField
        id="exitMonths"
        label="Time to exit"
        value={48}
        stableValue={48}
        choices={choices}
        suffix=" months"
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    const group = screen.getByRole("group", {
      name: "Time to exit common values",
    });
    expect(
      within(group).getByRole("button", { name: "4 years" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(within(group).getByRole("button", { name: "3 years" }));
    expect(onChange).toHaveBeenLastCalledWith(36);
  });

  it("keeps an arbitrary exact value with no quick choice pressed", () => {
    render(
      <QuickChoiceField
        id="exitMonths"
        label="Time to exit"
        value={43}
        stableValue={43}
        choices={choices}
        suffix=" months"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Time to exit")).toHaveValue("43 months");
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("associates validation feedback with the exact value", () => {
    render(
      <QuickChoiceField
        id="exitMonths"
        label="Time to exit"
        value={null}
        stableValue={48}
        choices={choices}
        suffix=" months"
        error="Must be greater than zero"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Time to exit");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Must be greater than zero");
  });
});
