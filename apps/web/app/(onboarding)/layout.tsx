/**
 * Onboarding layout — simple shell with a progress indicator.
 * Step 1 = /setup (add student), Step 2 = /subjects, Step 3 = /diagnostic.
 */

import type { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg-page">
      <header className="py-4 px-4 flex items-center justify-between border-b border-border-default bg-bg-surface">
        <a
          href="/dashboard"
          className="
            text-lg font-bold text-interactive-primary
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded-sm
          "
        >
          Revizr
        </a>

        {/* Visual progress steps */}
        <nav aria-label="Setup progress" className="flex items-center gap-2">
          <OnboardingStep step={1} label="Your child" />
          <StepDivider />
          <OnboardingStep step={2} label="Subjects" />
          <StepDivider />
          <OnboardingStep step={3} label="Diagnostic" />
        </nav>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex flex-col items-center px-4 py-10 focus-visible:outline-none"
      >
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </div>
  );
}

function OnboardingStep({
  step,
  label,
}: {
  step: number;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
      <span
        className="
          inline-flex items-center justify-center
          w-6 h-6 rounded-full
          bg-bg-surface-overlay
          text-text-tertiary text-xs font-semibold
        "
        aria-hidden="true"
      >
        {step}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function StepDivider() {
  return (
    <span
      aria-hidden="true"
      className="w-6 h-px bg-border-default hidden sm:block"
    />
  );
}
