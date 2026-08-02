import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FieldShell } from "./FieldShell";

describe("FieldShell", () => {
  it("provides shared description and error wiring to its control", () => {
    render(
      <FieldShell
        id="grantShares"
        label="Grant size"
        description="Copy this from the offer."
        error="Must be greater than zero"
      >
        {({ describedBy, invalid }) => (
          <input
            id="grantShares"
            aria-describedby={describedBy}
            aria-invalid={invalid}
          />
        )}
      </FieldShell>,
    );

    const input = screen.getByLabelText("Grant size");
    expect(input).toHaveAccessibleDescription(
      "Copy this from the offer. Must be greater than zero",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
