/**
 * SessionLog — accessible table of a child's recent sessions.
 *
 * WCAG: S6 — proper <th scope="col">, caption.
 */

import type { PracticeSession } from "@/lib/api";

interface SessionLogProps {
  sessions: PracticeSession[];
  childName: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(seconds: number) {
  if (seconds === 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function getScore(session: PracticeSession): string {
  if (!session.attempts || session.attempts.length === 0) return "—";
  const scored = session.attempts.filter((a) => a.self_mark_score != null);
  if (scored.length === 0) return "—";
  const avg =
    scored.reduce((sum, a) => sum + (a.self_mark_score ?? 0), 0) /
    scored.length;
  return `${Math.round(avg * 100)}%`;
}

function getTotalSeconds(session: PracticeSession): number {
  if (!session.attempts) return 0;
  return session.attempts.reduce(
    (sum, a) => sum + (a.time_spent_seconds ?? 0),
    0
  );
}

export function SessionLog({ sessions, childName }: SessionLogProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-text-secondary py-4">
        {childName} hasn&rsquo;t started any sessions yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-default bg-bg-surface shadow-card">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Recent practice sessions for {childName}
        </caption>
        <thead className="border-b border-border-default bg-bg-page">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
              Date
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
              Subject
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
              Duration
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {sessions.map((session) => (
            <tr
              key={session.id}
              className="hover:bg-bg-page transition-colors duration-fast"
            >
              <td className="px-4 py-3 text-text-primary">
                {formatDate(session.started_at)}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {session.subject_id}
              </td>
              <td className="px-4 py-3 text-right text-text-secondary">
                {formatDuration(getTotalSeconds(session))}
              </td>
              <td className="px-4 py-3 text-right text-text-secondary">
                {getScore(session)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
