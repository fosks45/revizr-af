/**
 * Progress page — score progression by subject and topic.
 *
 * WCAG:
 * - Bar charts use divs (not canvas) for screen reader access
 * - Colour + text label + icon (never colour alone) for status
 * - Data table behind chart for accessibility
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import {
  listSubjects,
  getProgressTopics,
  type Subject,
  type TopicProgress,
  RevizrApiError,
} from "@/lib/api";

function strengthBadge(avg: number): { variant: BadgeVariant; label: string } {
  if (avg >= 0.8) return { variant: "strong", label: "Strong" };
  if (avg >= 0.6) return { variant: "improving", label: "Improving" };
  if (avg >= 0.4) return { variant: "moderate", label: "Building" };
  if (avg >= 0.2) return { variant: "weak", label: "Needs practice" };
  return { variant: "critical", label: "Needs work" };
}

function BarChart({ topics }: { topics: TopicProgress[] }) {
  if (topics.length === 0) {
    return (
      <p className="text-text-tertiary text-sm py-4">
        No data yet for this subject.
      </p>
    );
  }

  const max = Math.max(...topics.map((t) => t.score_avg), 1);

  return (
    <div className="space-y-3" role="list" aria-label="Topic progress bars">
      {topics.map((topic) => {
        const pct = Math.round((topic.score_avg / max) * 100);
        const { variant, label } = strengthBadge(topic.score_avg);

        return (
          <div key={topic.topic_tag} role="listitem" className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-text-primary capitalize flex-1 min-w-0 truncate">
                {topic.topic_tag.replace(/_/g, " ")}
              </span>
              <Badge variant={variant} showIcon>
                {label}
              </Badge>
              <span className="text-xs text-text-secondary w-8 text-right shrink-0">
                {Math.round(topic.score_avg * 100)}%
              </span>
            </div>

            {/* Bar — div-based for a11y */}
            <div
              className="h-2 w-full bg-bg-surface-overlay rounded-full overflow-hidden"
              role="presentation"
            >
              <div
                className={`h-full rounded-full transition-all duration-deliberate easing-decelerate ${
                  variant === "strong" || variant === "improving"
                    ? "bg-status-strong"
                    : variant === "moderate"
                    ? "bg-status-moderate"
                    : variant === "weak"
                    ? "bg-status-weak"
                    : "bg-status-critical"
                }`}
                style={{ width: `${pct}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DataTable({ topics }: { topics: TopicProgress[] }) {
  if (topics.length === 0) return null;

  return (
    <details className="mt-6">
      <summary className="text-xs text-text-link cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm">
        View data table
      </summary>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border-default">
        <table className="w-full text-xs">
          <caption className="sr-only">Topic progress data</caption>
          <thead className="border-b border-border-default bg-bg-page">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-semibold text-text-secondary">
                Topic
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-text-secondary">
                Average score
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-text-secondary">
                Questions attempted
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-text-secondary">
                Correct
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {topics.map((t) => (
              <tr key={t.topic_tag}>
                <td className="px-3 py-2 text-text-primary capitalize">
                  {t.topic_tag.replace(/_/g, " ")}
                </td>
                <td className="px-3 py-2 text-right text-text-secondary">
                  {Math.round(t.score_avg * 100)}%
                </td>
                <td className="px-3 py-2 text-right text-text-secondary">
                  {t.questions_attempted}
                </td>
                <td className="px-3 py-2 text-right text-text-secondary">
                  {t.questions_correct}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export default function ProgressPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicProgress[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      try {
        const { subjects: data } = await listSubjects();
        const active = data.filter((s) => s.is_active);
        setSubjects(active);
        if (active.length > 0) setActiveSubjectId(active[0].id);
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        } else {
          setError("Unable to load your progress.");
        }
      } finally {
        setIsLoadingSubjects(false);
      }
    }
    void load();
  }, [router]);

  useEffect(() => {
    if (!activeSubjectId) return;
    setIsLoadingTopics(true);
    getProgressTopics({ subject_id: activeSubjectId, weeks: 8 })
      .then(({ topics: data }) => setTopics(data))
      .catch(() => setTopics([]))
      .finally(() => setIsLoadingTopics(false));
  }, [activeSubjectId]);

  if (isLoadingSubjects) {
    return (
      <div className="page-container py-8">
        <p className="text-text-tertiary text-sm" aria-live="polite">
          Loading progress…
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
        Your progress
      </h1>

      {subjects.length === 0 ? (
        <p className="text-text-secondary text-sm">
          No subjects yet.{" "}
          <a
            href="/subjects"
            className="text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          >
            Add subjects
          </a>
        </p>
      ) : (
        <>
          {/* Subject tabs */}
          <div
            role="tablist"
            aria-label="Subject selector"
            className="flex gap-2 flex-wrap mb-8 border-b border-border-default pb-2"
          >
            {subjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                role="tab"
                aria-selected={subject.id === activeSubjectId}
                onClick={() => setActiveSubjectId(subject.id)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-t-md
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                  transition-colors duration-fast
                  min-h-touch-min
                  ${
                    subject.id === activeSubjectId
                      ? "text-interactive-primary border-b-2 border-interactive-primary bg-bg-brand-subtle"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-overlay"
                  }
                `}
              >
                {subject.subject_name}
              </button>
            ))}
          </div>

          {/* Topic breakdown */}
          <section aria-labelledby="topics-heading">
            <h2
              id="topics-heading"
              className="text-md font-semibold text-text-primary mb-4"
            >
              Topic breakdown
            </h2>

            {isLoadingTopics ? (
              <p className="text-text-tertiary text-sm" aria-live="polite">
                Loading topics…
              </p>
            ) : (
              <>
                <BarChart topics={topics} />
                <DataTable topics={topics} />
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
