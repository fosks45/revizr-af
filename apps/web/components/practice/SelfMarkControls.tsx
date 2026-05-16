/**
 * SelfMarkControls — mark submission controls.
 *
 * Renders one button per score value (0 to maxMarks).
 * Each button is labelled "Award N mark(s)" for screen reader accessibility.
 *
 * WCAG: 4.1.2 — accessible name on every button. A3 — no icon-only controls.
 */

interface SelfMarkControlsProps {
  maxMarks: number;
  onMark: (mark: number) => void;
  selected?: number | null;
  disabled?: boolean;
}

export function SelfMarkControls({
  maxMarks,
  onMark,
  selected = null,
  disabled = false,
}: SelfMarkControlsProps) {
  const options = Array.from({ length: maxMarks + 1 }, (_, i) => i);

  return (
    <div
      role="group"
      aria-label={`Award marks out of ${maxMarks}`}
      className="flex flex-wrap gap-2"
    >
      {options.map((mark) => {
        const isSelected = selected === mark;
        return (
          <button
            key={mark}
            type="button"
            onClick={() => onMark(mark)}
            disabled={disabled}
            aria-label={`Award ${mark} mark${mark !== 1 ? "s" : ""} out of ${maxMarks}`}
            aria-pressed={isSelected}
            className={`
              flex items-center justify-center
              min-w-touch-min min-h-touch-min
              px-4 py-2 rounded-md text-sm font-semibold
              border transition-colors duration-fast
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-focus-ring focus-visible:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isSelected
                  ? "bg-interactive-primary text-text-inverse border-interactive-primary"
                  : "bg-bg-surface text-text-primary border-border-default hover:border-border-interactive hover:bg-bg-brand-subtle"
              }
            `}
          >
            {/* Visible label: "0", "1", "2"… */}
            <span aria-hidden="true">{mark}</span>
            {/* SR text clarifies context */}
            <span className="sr-only">
              {mark} mark{mark !== 1 ? "s" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
