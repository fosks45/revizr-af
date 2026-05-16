/**
 * Badge — compact status chip. WCAG: never colour alone; always has text label.
 * Used for topic strength status, subscription state, etc.
 */

import type { ReactNode } from "react";

export type BadgeVariant =
  | "critical"
  | "weak"
  | "moderate"
  | "strong"
  | "improving"
  | "neutral"
  | "accent"
  | "info";

const variantClasses: Record<BadgeVariant, string> = {
  critical: "bg-bg-error-subtle text-text-error border-border-error",
  weak: "bg-bg-warning-subtle text-status-weak border-status-weak",
  moderate: "bg-bg-accent-subtle text-status-moderate border-status-moderate",
  strong: "bg-bg-success-subtle text-status-strong border-border-success",
  improving: "bg-bg-success-subtle text-status-improving border-border-success",
  neutral: "bg-bg-surface-overlay text-text-tertiary border-border-default",
  accent: "bg-bg-accent-subtle text-accent-primary border-status-moderate",
  info: "bg-bg-info-subtle text-text-secondary border-border-default",
};

/** Status icons — always paired with text label (WCAG 1.4.1) */
export const statusIcons: Record<BadgeVariant, string> = {
  critical: "!!",
  weak: "↓",
  moderate: "–",
  strong: "✓",
  improving: "↑",
  neutral: "○",
  accent: "★",
  info: "ℹ",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  /** Show the status icon prefix */
  showIcon?: boolean;
  className?: string;
}

export function Badge({
  variant = "neutral",
  children,
  showIcon = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5
        text-xs font-medium
        border rounded-sm
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {showIcon && (
        <span aria-hidden="true">{statusIcons[variant]}</span>
      )}
      {children}
    </span>
  );
}
