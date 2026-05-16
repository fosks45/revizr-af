/**
 * MarkSchemeReveal — hidden mark scheme that reveals on demand.
 *
 * WCAG compliance:
 * - Uses aria-expanded to communicate state to assistive technology
 * - Smooth height transition respects prefers-reduced-motion
 * - Content is hidden via height/opacity, not display:none, so AT can
 *   still find it when revealed
 */

"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface MarkSchemeRevealProps {
  markSchemeText: string;
  revealed: boolean;
  onReveal: () => void;
}

export function MarkSchemeReveal({
  markSchemeText,
  revealed,
  onReveal,
}: MarkSchemeRevealProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // After reveal, move focus into the mark scheme content
  useEffect(() => {
    if (revealed && contentRef.current) {
      contentRef.current.focus();
    }
  }, [revealed]);

  return (
    <div className="border border-border-default rounded-lg overflow-hidden">
      {/* Toggle button */}
      <button
        type="button"
        onClick={onReveal}
        aria-expanded={revealed}
        aria-controls="mark-scheme-content"
        className={`
          w-full flex items-center justify-between
          px-4 py-3 text-sm font-semibold
          transition-colors duration-fast
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-focus-ring focus-visible:ring-offset-2
          ${
            revealed
              ? "bg-bg-brand-subtle text-interactive-primary"
              : "bg-bg-surface text-text-primary hover:bg-bg-surface-overlay"
          }
        `}
      >
        <span>Mark scheme</span>
        <span
          aria-hidden="true"
          className={`text-sm transition-transform duration-normal ${
            revealed ? "rotate-180" : ""
          }`}
          style={{
            transitionProperty: "transform",
          }}
        >
          ▾
        </span>
      </button>

      {/* Revealed content */}
      <div
        id="mark-scheme-content"
        ref={contentRef}
        tabIndex={revealed ? -1 : undefined}
        role="region"
        aria-label="Mark scheme"
        aria-hidden={!revealed}
        className={`
          overflow-hidden
          @motion-reduce:transition-none
          transition-[max-height,opacity] duration-normal easing-decelerate
          ${revealed ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
        `}
        style={{
          /* Fallback for browsers that don't support @motion-reduce */
          transition: "max-height var(--duration-normal, 200ms) var(--easing-decelerate), opacity var(--duration-normal, 200ms) var(--easing-decelerate)",
        }}
      >
        <div className="px-4 py-4 border-t border-border-default bg-bg-success-subtle">
          <p className="text-xs font-semibold text-text-success mb-2 uppercase tracking-wider">
            Mark scheme
          </p>
          <div
            className="text-sm text-text-primary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: markSchemeText }}
          />
        </div>
      </div>
    </div>
  );
}
