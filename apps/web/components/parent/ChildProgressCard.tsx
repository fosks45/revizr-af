/**
 * ChildProgressCard — summary card for one child's recent activity.
 */

import type { ChildSummary, PracticeSession } from "@/lib/api";

interface ChildProgressCardProps {
  child: ChildSummary;
  recentSessions: PracticeSession[];
  topWeakTopic?: string | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getTotalMinutes(sessions: PracticeSession[]): number {
  return sessions.reduce((sum, s) => {
    const minutes = s.attempts
      ? Math.ceil(
          s.attempts.reduce((t, a) => t + (a.time_spent_seconds ?? 0), 0) / 60
        )
      : 0;
    return sum + minutes;
  }, 0);
}

export function ChildProgressCard({
  child,
  recentSessions,
  topWeakTopic,
}: ChildProgressCardProps) {
  const today = new Date().toDateString();
  const sessionsToday = recentSessions.filter(
    (s) => new Date(s.started_at).toDateString() === today
  ).length;

  const lastSession = recentSessions[0];
  const totalMinutes = getTotalMinutes(recentSessions);

  return (
    <article
      aria-label={`Progress summary for ${child.display_name}`}
      className="bg-bg-surface border border-border-default rounded-lg p-6 shadow-card"
    >
      <h3 className="text-md font-bold text-text-primary mb-4">
        {child.display_name}
      </h3>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-4">
        <StatItem
          label="Sessions today"
          value={sessionsToday === 0 ? "None" : String(sessionsToday)}
        />
        <StatItem
          label="Total time"
          value={
            totalMinutes > 0 ? `${totalMinutes} min` : "—"
          }
        />
        <StatItem
          label="Last session"
          value={lastSession ? formatDate(lastSession.started_at) : "Not started"}
        />
      </dl>

      {topWeakTopic && (
        <div className="pt-4 border-t border-border-default">
          <p className="text-xs text-text-tertiary">
            Weakest area:{" "}
            <span className="text-text-primary font-medium capitalize">
              {topWeakTopic.replace(/_/g, " ")}
            </span>
          </p>
        </div>
      )}

      {child.subjects.length > 0 && (
        <div className="pt-3 flex flex-wrap gap-1">
          {child.subjects.slice(0, 4).map((s) => (
            <span
              key={s.id}
              className="
                px-2 py-0.5 text-xs
                bg-bg-surface-overlay text-text-tertiary
                rounded-sm border border-border-default
              "
            >
              {s.subject_name}
            </span>
          ))}
          {child.subjects.length > 4 && (
            <span className="text-xs text-text-tertiary px-1 py-0.5">
              +{child.subjects.length - 4} more
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-text-tertiary mb-0.5">{label}</dt>
      <dd className="text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}
