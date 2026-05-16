/**
 * Progress — topic weakness progress bar.
 *
 * WCAG compliance:
 * - Uses native <progress> or role="progressbar" with aria-valuenow/min/max
 * - Colour never sole indicator: percentage shown as text
 * - aria-label required for context
 */

interface ProgressProps {
  value: number; // 0–100
  max?: number;
  /** Accessible label — describes what is being measured */
  "aria-label": string;
  variant?: "default" | "success" | "warning" | "critical";
  showLabel?: boolean;
  className?: string;
}

const variantTrackColor: Record<string, string> = {
  default: "bg-interactive-primary",
  success: "bg-status-strong",
  warning: "bg-status-weak",
  critical: "bg-status-critical",
};

export function Progress({
  value,
  max = 100,
  "aria-label": ariaLabel,
  variant = "default",
  showLabel = true,
  className = "",
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-tertiary">{ariaLabel}</span>
          <span className="text-xs font-medium text-text-secondary">
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full bg-bg-surface-overlay rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-deliberate easing-decelerate ${variantTrackColor[variant]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
