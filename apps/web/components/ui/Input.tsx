/**
 * Input — text input with accessible label and error state.
 *
 * WCAG compliance:
 * - F1: Always has associated <label> or aria-label (never placeholder-only)
 * - F2: Error messages linked via aria-describedby
 * - WCAG 1.3.5: autocomplete attribute required for personal data fields
 */

import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  /** Hide label visually but keep accessible */
  srOnlyLabel?: boolean;
  errorMessage?: string;
  helpText?: ReactNode;
  /** Required indicator — shown as * (aria-hidden) with surrounding note */
  required?: boolean;
}

export function Input({
  id,
  label,
  srOnlyLabel = false,
  errorMessage,
  helpText,
  required,
  className = "",
  ...inputProps
}: InputProps) {
  const errorId = errorMessage ? `${id}-error` : undefined;
  const helpId = helpText ? `${id}-help` : undefined;

  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="w-full">
      <Label
        htmlFor={id}
        required={required}
        className={srOnlyLabel ? "sr-only" : undefined}
      >
        {label}
      </Label>

      {helpText && (
        <p id={helpId} className="text-xs text-text-tertiary mt-0.5 mb-1">
          {helpText}
        </p>
      )}

      <input
        id={id}
        required={required}
        aria-required={required}
        aria-invalid={errorMessage ? "true" : undefined}
        aria-describedby={describedBy}
        className={`
          input-base
          ${errorMessage ? "border-border-error" : ""}
          ${className}
        `}
        {...inputProps}
      />

      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-xs text-text-error flex items-center gap-1"
        >
          <span aria-hidden="true">⚠</span>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// ─── Label sub-component ────────────────────────────────────────────────────

interface LabelProps {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function Label({ htmlFor, children, required, className = "" }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-text-primary mb-1 ${className}`}
    >
      {children}
      {required && (
        <>
          {" "}
          <span aria-hidden="true" className="text-text-error">
            *
          </span>
        </>
      )}
    </label>
  );
}
