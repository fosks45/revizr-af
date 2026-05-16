/**
 * WeaknessMapServer — client component wrapper that fetches results
 * for the results/[sessionId] page.
 *
 * Uses client-side fetch since the access token lives in memory (C6 data class —
 * never on server). Falls back gracefully if the session is not yet ready.
 */

"use client";

import { useEffect, useState } from "react";
import { getDiagnosticResults, type WeaknessResult } from "@/lib/api";
import { WeaknessMap } from "./WeaknessMap";
import { Alert } from "@/components/ui/Alert";

interface WeaknessMapServerProps {
  sessionId: string;
}

export function WeaknessMapServer({ sessionId }: WeaknessMapServerProps) {
  const [topics, setTopics] = useState<WeaknessResult[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getDiagnosticResults(sessionId)
      .then(({ results }) => setTopics(results))
      .catch(() => setError(true));
  }, [sessionId]);

  if (error) {
    return (
      <Alert variant="warning">
        Results are still being processed. Please refresh in a moment, or check
        back from your dashboard.
      </Alert>
    );
  }

  if (topics === null) {
    return (
      <p className="text-text-tertiary text-sm" aria-live="polite">
        Loading results…
      </p>
    );
  }

  return <WeaknessMap topics={topics} />;
}
