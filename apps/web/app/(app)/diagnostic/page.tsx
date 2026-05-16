/**
 * Diagnostic method selection — choose between report upload or quiz.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Start your diagnostic",
};

export default function DiagnosticPage() {
  return (
    <div className="page-container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          How do you want us to find your weak spots?
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Both options are free. You can run the diagnostic again at any time.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <DiagnosticOption
            href="/diagnostic/upload"
            title="Upload your school report"
            description="We'll read your teacher's comments and build your topic map from that."
            time="Takes: under 2 mins"
            icon="📄"
          />
          <DiagnosticOption
            href="/diagnostic/quiz"
            title="Take a short quiz"
            description="Answer a few questions and we'll map your topics for you."
            time="Takes: about 10–20 min"
            icon="✏️"
          />
        </div>
      </div>
    </div>
  );
}

interface DiagnosticOptionProps {
  href: string;
  title: string;
  description: string;
  time: string;
  icon: string;
}

function DiagnosticOption({
  href,
  title,
  description,
  time,
  icon,
}: DiagnosticOptionProps) {
  return (
    <Link
      href={href}
      className="
        block p-6 rounded-lg border border-border-default bg-bg-surface
        shadow-card hover:shadow-card-hover hover:border-border-interactive
        transition-shadow duration-normal easing-standard
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
        focus-visible:ring-offset-2
        group
      "
    >
      <span
        aria-hidden="true"
        className="text-3xl block mb-3"
      >
        {icon}
      </span>
      <h2 className="text-sm font-semibold text-text-primary mb-1 group-hover:text-interactive-primary transition-colors duration-fast">
        {title}
      </h2>
      <p className="text-xs text-text-secondary mb-4">{description}</p>
      <p className="text-xs text-text-tertiary font-medium">{time}</p>
    </Link>
  );
}
