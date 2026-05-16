/**
 * Button — primary, secondary, ghost, and destructive variants.
 *
 * WCAG compliance:
 * - Minimum 44×44px touch target (touch-target-min token)
 * - Icon-only buttons require aria-label prop
 * - disabled state uses aria-disabled and is not focusable when disabled
 * - Focus ring via :focus-visible
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
  /** Required when button contains only an icon with no visible text */
  "aria-label"?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-interactive-primary text-text-inverse
    hover:bg-interactive-primary-hover
    active:bg-interactive-primary-pressed
    disabled:bg-interactive-primary-disabled disabled:text-text-disabled
    disabled:cursor-not-allowed
  `,
  secondary: `
    bg-interactive-secondary text-interactive-secondary-text
    border border-border-default
    hover:bg-interactive-secondary-hover
    disabled:bg-bg-disabled disabled:text-text-disabled disabled:border-border-disabled
    disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-text-primary
    hover:bg-interactive-ghost-hover
    disabled:text-text-disabled
    disabled:cursor-not-allowed
  `,
  destructive: `
    bg-bg-error-subtle text-text-error
    border border-border-error
    hover:bg-text-error hover:text-text-inverse
    disabled:bg-bg-disabled disabled:text-text-disabled disabled:border-border-disabled
    disabled:cursor-not-allowed
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-touch-min px-3 text-sm font-medium rounded-md",
  md: "h-touch-default px-4 text-sm font-semibold rounded-md",
  lg: "h-touch-large px-6 text-md font-semibold rounded-md",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        w-full
        font-base
        transition-colors duration-fast easing-standard
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-ring-offset
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <span className="sr-only">Loading</span>
          <span aria-hidden="true" className="animate-spin">⟳</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
