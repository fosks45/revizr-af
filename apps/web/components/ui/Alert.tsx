/**
 * Alert — status messages and error banners.
 *
 * WCAG compliance:
 * - A8: role="alert" for errors (assertive), role="status" for informational
 * - 4.1.3: announced by screen readers without receiving focus
 * - Never colour alone: icon + text + border colour
 */

import type { ReactNode } from "react";

export type AlertVariant = "error" | "warning" | "success" | "info";

const variantConfig: Record<
  AlertVariant,
  { role: "alert" | "status"; icon: string; classes: string }
> = {
  error: {
    role: "alert",
    icon: "⚠",
    classes:
      "bg-bg-error-subtle border-border-error text-text-error",
  },
  warning: {
    role: "status",
    icon: "⚠",
    classes:
      "bg-bg-warning-subtle border-status-weak text-status-weak",
  },
  success: {
    role: "status",
    icon: "✓",
    classes:
      "bg-bg-success-subtle border-border-success text-text-success",
  },
  info: {
    role: "status",
    icon: "ℹ",
    classes:
      "bg-bg-info-subtle border-border-default text-text-secondary",
  },
};

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = "info", children, className = "" }: AlertProps) {
  const { role, icon, classes } = variantConfig[variant];

  return (
    <div
      role={role}
      className={`
        flex items-start gap-2
        p-4 rounded-lg border
        text-sm
        ${classes}
        ${className}
      `}
    >
      <span aria-hidden="true" className="text-base leading-none mt-0.5 shrink-0">
        {icon}
      </span>
      <div>{children}</div>
    </div>
  );
}
