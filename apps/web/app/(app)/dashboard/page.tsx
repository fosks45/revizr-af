/**
 * Student dashboard — home page for authenticated users.
 *
 * Conditional rendering:
 * - No diagnostic yet → CTA card "Start your diagnostic"
 * - Diagnostic exists → WeaknessMap + top 3 weak topics + CTA
 * - Recent sessions list (last 5)
 * - Streak badge (feature-flagged)
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { WeaknessMap } from "@/components/diagnostic/WeaknessMap";
import { useFeatureFlag } from "@/lib/hooks/useFeatureFlag";
import {
  getUsersMe,
  getDiagnosticResults,
  type UserProfile,
  type WeaknessResult,
  type PracticeSession,
  RevizrApiError,
} from "@/lib/api";
// Note: listSubjects and getJobStatus are imported by sub-components (WeaknessMap etc.)

// In a real app, the last diagnostic session ID would come from the user profile
// or a dedicated /diagnostic/latest endpoint. We simulate with localStorage for now.
function getLastDiagnosticSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("revizr_last_diagnostic_session_id");
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ScorePercent({ attempts }: { attempts?: { self_mark_score?: number | null; question_id: string }[] }) {
  if (!attempts || attempts.length === 0) return <span className="text-text-tertiary">—</span>;
  const scored = attempts.filter((a) => a.self_mark_score != null);
  if (scored.length === 0) return <span className="text-text-tertiary">—</span>;
  const avg =
    scored.reduce((sum, a) => sum + (a.self_mark_score ?? 0), 0) /
    scored.length;
  return <span>{Math.round(avg * 100)}%</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const streaksEnabled = useFeatureFlag("streaks");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [weaknessTopics, setWeaknessTopics] = useState<WeaknessResult[] | null>(null);
  const [recentSessions] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      try {
        const profile = await getUsersMe();
        setUser(profile);

        const sessionId = getLastDiagnosticSessionId();
        if (sessionId) {
          try {
            const results = await getDiagnosticResults(sessionId);
            setWeaknessTopics(results.results);
          } catch {
            // Diagnostic results not available — show CTA
          }
        }
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        } else {
          setError("Unable to load your dashboard. Please refresh.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [router]);

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <p className="text-text-tertiary text-sm" aria-live="polite">
          Loading…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-8">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  const topWeakTopics = weaknessTopics
    ? [...weaknessTopics]
        .sort((a, b) => b.weakness_score - a.weakness_score)
        .slice(0, 3)
    : [];

  return (
    <div className="page-container py-8 space-y-8">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {user ? `Welcome back, ${user.display_name}` : "Dashboard"}
          </h1>
          {streaksEnabled && (
            <div className="mt-2">
              <Badge variant="accent" showIcon>
                7-day streak
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Diagnostic CTA or WeaknessMap */}
      {weaknessTopics === null ? (
        <Card className="text-center py-12">
          <p className="text-lg font-semibold text-text-primary mb-2">
            Let&rsquo;s find your weak spots
          </p>
          <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
            Run a diagnostic so we can target your revision exactly where it&rsquo;s
            needed most.
          </p>
          <Button
            onClick={() => router.push("/diagnostic")}
            className="max-w-xs mx-auto"
          >
            Start your diagnostic
          </Button>
        </Card>
      ) : (
        <section aria-labelledby="weakness-heading">
          <h2
            id="weakness-heading"
            className="text-md font-semibold text-text-primary mb-4"
          >
            Your topic map
          </h2>
          <WeaknessMap topics={weaknessTopics} />

          {topWeakTopics.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">
                Top areas to focus on
              </h3>
              <ol className="space-y-2" aria-label="Top 3 weakest topics">
                {topWeakTopics.map((topic, i) => (
                  <li key={topic.topic_tag} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="text-xs text-text-tertiary w-5 text-right shrink-0"
                    >
                      {i + 1}.
                    </span>
                    <span className="text-sm text-text-primary capitalize flex-1">
                      {topic.topic_tag.replace(/_/g, " ")}
                    </span>
                    <Badge
                      variant={
                        topic.weakness_score >= 0.8
                          ? "critical"
                          : topic.weakness_score >= 0.6
                          ? "weak"
                          : "moderate"
                      }
                      showIcon
                    >
                      {Math.round(topic.weakness_score * 100)}% weakness
                    </Badge>
                  </li>
                ))}
              </ol>

              <div className="mt-6">
                <Button
                  onClick={() => router.push("/practice")}
                  className="max-w-xs"
                >
                  Start practice session
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <section aria-labelledby="recent-sessions-heading">
          <h2
            id="recent-sessions-heading"
            className="text-md font-semibold text-text-primary mb-4"
          >
            Recent sessions
          </h2>
          <Card noPadding>
            <ul role="list" className="divide-y divide-border-default">
              {recentSessions.slice(0, 5).map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between px-6 py-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {session.subject_id}
                    </p>
                    <p className="text-text-tertiary text-xs mt-0.5">
                      {formatDate(session.started_at)} &middot;{" "}
                      {session.question_count} questions
                    </p>
                  </div>
                  <ScorePercent attempts={session.attempts} />
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}
