/**
 * ParentDashboardContent — client component for the parent dashboard.
 *
 * Handles child selector, ChildProgressCard, SessionLog, and plain-English summary.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { ChildProgressCard } from "./ChildProgressCard";
import { SessionLog } from "./SessionLog";
import {
  listChildren,
  getChildSessions,
  getChildProgress,
  type ChildSummary,
  type PracticeSession,
  type ProgressSummary,
  RevizrApiError,
} from "@/lib/api";

function buildSummary(
  child: ChildSummary,
  sessions: PracticeSession[],
  progress: ProgressSummary[]
): string {
  const name = child.display_name;

  if (sessions.length === 0) {
    return `${name} hasn't started any revision sessions yet.`;
  }

  const lastSession = sessions[0];
  const lastDate = new Date(lastSession.started_at);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const whenStr =
    diffDays === 0
      ? "today"
      : diffDays === 1
      ? "yesterday"
      : `${diffDays} days ago`;

  const totalSeconds = lastSession.attempts
    ? lastSession.attempts.reduce(
        (sum, a) => sum + (a.time_spent_seconds ?? 0),
        0
      )
    : 0;
  const totalMinutes = Math.round(totalSeconds / 60);

  const subject = child.subjects.find(
    (s) => s.id === lastSession.subject_id
  )?.subject_name;

  const topTopic = progress
    .flatMap((p) => p.topics)
    .sort((a, b) => a.score_avg - b.score_avg)[0]?.topic_tag;

  let summary = `${name} revised`;
  if (totalMinutes > 0) {
    summary += ` for ${totalMinutes} minute${totalMinutes !== 1 ? "s" : ""}`;
  }
  summary += ` ${whenStr}`;
  if (subject) summary += `, focusing on ${subject}`;
  summary += ".";
  if (topTopic) {
    summary += ` Their weakest area is ${topTopic.replace(/_/g, " ")}.`;
  }

  return summary;
}

export function ParentDashboardContent() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [progress, setProgress] = useState<ProgressSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChild, setIsLoadingChild] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      try {
        const { children: data } = await listChildren();
        setChildren(data);
        if (data.length > 0) setSelectedId(data[0].student_id);
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        } else {
          setError("Unable to load your children. Please refresh.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [router]);

  useEffect(() => {
    if (!selectedId) return;
    setIsLoadingChild(true);

    Promise.all([
      getChildSessions(selectedId, { limit: 10 }),
      getChildProgress(selectedId),
    ])
      .then(([{ sessions: sess }, prog]) => {
        setSessions(sess);
        setProgress(prog);
      })
      .catch(() => {
        setSessions([]);
        setProgress([]);
      })
      .finally(() => setIsLoadingChild(false));
  }, [selectedId]);

  if (isLoading) {
    return (
      <p className="text-text-tertiary text-sm" aria-live="polite">
        Loading…
      </p>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-sm mb-4">
          You haven&rsquo;t added any children yet.
        </p>
        <a
          href="/setup"
          className="text-text-link font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
        >
          Add a child&rsquo;s account
        </a>
      </div>
    );
  }

  const selectedChild = children.find((c) => c.student_id === selectedId);
  const topWeakTopic = progress
    .flatMap((p) => p.topics)
    .sort((a, b) => a.score_avg - b.score_avg)[0]?.topic_tag ?? null;

  const summary =
    selectedChild
      ? buildSummary(selectedChild, sessions, progress)
      : null;

  return (
    <div className="space-y-8">
      {/* Child selector */}
      {children.length > 1 && (
        <div>
          <label
            htmlFor="parent-child-select"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Viewing progress for
          </label>
          <select
            id="parent-child-select"
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="input-base w-full max-w-xs"
          >
            {children.map((c) => (
              <option key={c.student_id} value={c.student_id}>
                {c.display_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Plain-English summary */}
      {summary && (
        <div
          className="bg-bg-brand-subtle border border-border-interactive rounded-lg p-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-text-primary">{summary}</p>
        </div>
      )}

      {isLoadingChild ? (
        <p className="text-text-tertiary text-sm" aria-live="polite">
          Loading activity…
        </p>
      ) : (
        selectedChild && (
          <>
            <ChildProgressCard
              child={selectedChild}
              recentSessions={sessions.slice(0, 5)}
              topWeakTopic={topWeakTopic}
            />

            <section aria-labelledby="session-log-heading">
              <h2
                id="session-log-heading"
                className="text-md font-semibold text-text-primary mb-4"
              >
                Recent sessions
              </h2>
              <SessionLog
                sessions={sessions.slice(0, 10)}
                childName={selectedChild.display_name}
              />
            </section>
          </>
        )
      )}
    </div>
  );
}
