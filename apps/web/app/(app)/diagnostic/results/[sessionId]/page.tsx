/**
 * Diagnostic results page — renders WeaknessMap for a given session.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { WeaknessMapServer } from "@/components/diagnostic/WeaknessMapServer";

export const metadata: Metadata = {
  title: "Your diagnostic results",
};

interface ResultsPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function DiagnosticResultsPage({ params }: ResultsPageProps) {
  const { sessionId } = await params;
  // WeaknessMapServer is a client component — rendered client-side for auth token access

  return (
    <div className="page-container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Your diagnostic results
          </h1>
          <p className="text-sm text-text-secondary">
            Here&rsquo;s where your revision will have the most impact.
          </p>
        </div>

        <WeaknessMapServer sessionId={sessionId} />

        <div className="mt-8">
          <Link
            href="/practice"
            className="
              inline-flex items-center justify-center w-full
              h-touch-default px-6
              bg-interactive-primary text-text-inverse
              font-semibold text-sm rounded-md
              hover:bg-interactive-primary-hover
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
              focus-visible:ring-offset-2
              transition-colors duration-fast
            "
          >
            Start practising your weakest topics
          </Link>
        </div>
      </div>
    </div>
  );
}
