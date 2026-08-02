import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MoneyField } from "./MoneyField";

describe("MoneyField", () => {
  it("accepts shorthand and formats whole dollars on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBlur = vi.fn();

    render(
      <MoneyField
        id="exitCompanyValue"
        label="Potential exit value"
        value={1_500_000_000}
        onChange={onChange}
        onBlur={onBlur}
      />,
    );

    const input = screen.getByLabelText("Potential exit value");
    await user.clear(input);
    await user.type(input, "2.25b");
    expect(onChange).toHaveBeenLastCalledWith(2_250_000_000);

    await user.tab();
    expect(input).toHaveValue("$2,250,000,000");
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("rounds plain-dollar decimals on change and blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MoneyField
        id="currentCompanyValue"
        label="Company value today"
        value={0}
        onChange={onChange}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Company value today");
    await user.clear(input);
    await user.type(input, "12.75");
    expect(onChange).toHaveBeenLastCalledWith(13);

    await user.tab();
    expect(input).toHaveValue("$13");
  });

  it("uses an external value update that arrives while editing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBlur = vi.fn();
    const props = {
      id: "exitCompanyValue",
      label: "Potential exit value",
      onChange,
      onBlur,
    };
    const { rerender } = render(<MoneyField {...props} value={1} />);

    const input = screen.getByLabelText("Potential exit value");
    await user.clear(input);
    await user.type(input, "2.25");
    expect(onChange).toHaveBeenLastCalledWith(2);

    rerender(<MoneyField {...props} value={3.5} />);
    await user.tab();

    expect(input).toHaveValue("$4");
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("associates validation feedback with the exact currency input", () => {
    render(
      <MoneyField
        id="currentCompanyValue"
        label="Company value today"
        value={0}
        error="Must be greater than zero"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Company value today");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Must be greater than zero");
  });
});
