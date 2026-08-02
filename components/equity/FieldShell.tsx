import type { ReactNode } from "react";

export interface FieldControlA11y {
  describedBy: string | undefined;
  invalid: boolean;
}

interface FieldShellProps {
  id: string;
  label: string;
  description?: string;
  externalDescribedBy?: string;
  error?: string;
  rich?: boolean;
  children: (a11y: FieldControlA11y) => ReactNode;
}

export function FieldShell({
  id,
  label,
  description,
  externalDescribedBy,
  error,
  rich = false,
  children,
}: FieldShellProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [externalDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={`field-group${rich ? " field-group-rich" : ""}`}>
      <div className="field-copy">
        <label htmlFor={id}>{label}</label>
        {description ? (
          <p id={descriptionId} className="field-description">
            {description}
          </p>
        ) : null}
      </div>
      <div className="field-control">
        {children({ describedBy, invalid: Boolean(error) })}
        {error ? (
          <p id={errorId} className="field-error">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
