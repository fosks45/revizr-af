/**
 * Practice session history — sortable, accessible table.
 *
 * WCAG: S6 — proper <th scope="col">, caption, sorted column announced.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import {
  listSubjects,
  type PracticeSession,
  type Subject,
  RevizrApiError,
} from "@/lib/api";

type SortKey = "started_at" | "subject" | "questions" | "score" | "time";
type SortDir = "asc" | "desc";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function computeScore(session: PracticeSession): number | null {
  if (!session.attempts || session.attempts.length === 0) return null;
  const scored = session.attempts.filter((a) => a.self_mark_score != null);
  if (scored.length === 0) return null;
  return Math.round(
    (scored.reduce((sum, a) => sum + (a.self_mark_score ?? 0), 0) /
      scored.length) *
      100
  );
}

function computeTime(session: PracticeSession): number {
  if (!session.attempts) return 0;
  return session.attempts.reduce(
    (sum, a) => sum + (a.time_spent_seconds ?? 0),
    0
  );
}

export default function PracticeHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [sortKey, setSortKey] = useState<SortKey>("started_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    async function load() {
      try {
        const { subjects } = await listSubjects();
        const map: Record<string, Subject> = {};
        for (const s of subjects) map[s.id] = s;
        setSubjectMap(map);
        // In production, there'd be a GET /practice/sessions endpoint.
        // Using empty array as placeholder.
        setSessions([]);
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        } else {
          setError("Unable to load your session history.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [router]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...sessions].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "started_at":
        cmp = new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
        break;
      case "subject":
        cmp = (subjectMap[a.subject_id]?.subject_name ?? "").localeCompare(
          subjectMap[b.subject_id]?.subject_name ?? ""
        );
        break;
      case "questions":
        cmp = a.question_count - b.question_count;
        break;
      case "score":
        cmp = (computeScore(a) ?? 0) - (computeScore(b) ?? 0);
        break;
      case "time":
        cmp = computeTime(a) - computeTime(b);
        break;
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  const SortableHeader = ({
    sortId,
    children,
  }: {
    sortId: SortKey;
    children: React.ReactNode;
  }) => {
    const active = sortId === sortKey;
    const indicator = active ? (sortDir === "asc" ? " ↑" : " ↓") : "";
    return (
      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-secondary whitespace-nowrap">
        <button
          type="button"
          onClick={() => handleSort(sortId)}
          className="
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
            rounded-sm
          "
          aria-sort={
            active ? (sortDir === "asc" ? "ascending" : "descending") : "none"
          }
        >
          {children}
          <span aria-hidden="true" className="ml-1 text-text-tertiary">
            {indicator || " ↕"}
          </span>
        </button>
      </th>
    );
  };

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <p className="text-text-tertiary text-sm" aria-live="polite">
          Loading history…
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

  return (
    <div className="page-container py-8">
      <h1 className="text-xl font-bold text-text-primary mb-6">
        Session history
      </h1>

      {sorted.length === 0 ? (
        <p className="text-text-secondary text-sm">
          No sessions yet.{" "}
          <a
            href="/practice"
            className="text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          >
            Start practising
          </a>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-default bg-bg-surface shadow-card">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Practice session history, sorted by {sortKey}{" "}
              {sortDir === "asc" ? "ascending" : "descending"}
            </caption>
            <thead className="border-b border-border-default bg-bg-page">
              <tr>
                <SortableHeader sortId="started_at">Date</SortableHeader>
                <SortableHeader sortId="subject">Subject</SortableHeader>
                <SortableHeader sortId="questions">Questions</SortableHeader>
                <SortableHeader sortId="score">Score</SortableHeader>
                <SortableHeader sortId="time">Time</SortableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {sorted.map((session) => {
                const subject = subjectMap[session.subject_id];
                const score = computeScore(session);
                const time = computeTime(session);
                return (
                  <tr
                    key={session.id}
                    className="hover:bg-bg-page transition-colors duration-fast"
                  >
                    <td className="px-4 py-3 text-text-primary">
                      {formatDate(session.started_at)}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {subject?.subject_name ?? session.subject_id}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {session.question_count}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {score !== null ? `${score}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {time > 0 ? formatDuration(time) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
