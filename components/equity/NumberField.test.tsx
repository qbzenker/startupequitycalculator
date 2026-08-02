import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NumberField } from "./NumberField";

describe("NumberField", () => {
  it("associates help and errors while emitting an exact number", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <NumberField
        id="grantShares"
        label="Grant size"
        description="Copy this from the offer."
        error="Must be greater than zero"
        value={20_000}
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Grant size");
    expect(input).toHaveAccessibleDescription(
      "Copy this from the offer. Must be greater than zero",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");

    await user.clear(input);
    await user.type(input, "25000");
    expect(onChange).toHaveBeenLastCalledWith(25_000);
  });
});
