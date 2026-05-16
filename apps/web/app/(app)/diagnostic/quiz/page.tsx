/**
 * Diagnostic quiz page — multi-step in-product quiz.
 */

import type { Metadata } from "next";
import { DiagnosticQuiz } from "@/components/diagnostic/DiagnosticQuiz";

export const metadata: Metadata = {
  title: "Diagnostic quiz",
};

export default function DiagnosticQuizPage() {
  return (
    <div className="page-container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Diagnostic quiz
          </h1>
          <p className="text-sm text-text-secondary">
            Answer a few questions per subject and we&rsquo;ll map exactly where
            you need to focus.
          </p>
        </div>

        <DiagnosticQuiz />
      </div>
    </div>
  );
}
