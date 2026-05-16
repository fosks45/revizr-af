/**
 * Practice subject selector — shows the user's subjects as cards.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { listSubjects, type Subject, RevizrApiError } from "@/lib/api";

const LEVEL_LABELS: Record<Subject["level"], string> = {
  "11plus": "11+",
  ks3: "KS3",
  gcse: "GCSE",
  alevel: "A-level",
};

function weaknessBadge(score: number): { variant: BadgeVariant; label: string } {
  if (score >= 0.8) return { variant: "critical", label: "Most needs work" };
  if (score >= 0.6) return { variant: "weak", label: "Needs practice" };
  if (score >= 0.4) return { variant: "moderate", label: "Building confidence" };
  return { variant: "strong", label: "Looking good" };
}

// Placeholder — in production this would come from the progress API
function getWeaknessScore(subjectId: string): number {
  void subjectId;
  return 0;
}

function getLastPracticed(subjectId: string): string | null {
  void subjectId;
  return null;
}

export default function PracticePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      try {
        const { subjects: data } = await listSubjects();
        setSubjects(data.filter((s) => s.is_active));
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        } else {
          setError("Unable to load your subjects. Please refresh.");
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
          Loading your subjects…
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
      <h1 className="text-xl font-bold text-text-primary mb-2">
        Choose a subject to practise
      </h1>
      <p className="text-sm text-text-secondary mb-8">
        Questions are targeted at your weakest topics first.
      </p>

      {subjects.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-secondary text-sm mb-4">
            You haven&rsquo;t added any subjects yet.
          </p>
          <a
            href="/subjects"
            className="text-text-link text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          >
            Add subjects
          </a>
        </Card>
      ) : (
        <ul
          role="list"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Your subjects"
        >
          {subjects.map((subject) => {
            const weakness = getWeaknessScore(subject.id);
            const lastPracticed = getLastPracticed(subject.id);
            const { variant, label } = weaknessBadge(weakness);

            return (
              <li key={subject.id}>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/practice/session?subject_id=${subject.id}`
                    )
                  }
                  className="
                    w-full text-left p-6 rounded-lg border border-border-default bg-bg-surface
                    shadow-card hover:shadow-card-hover hover:border-border-interactive
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                    focus-visible:ring-offset-2
                    transition-shadow duration-normal
                    group
                  "
                  aria-label={`Start ${subject.subject_name} practice session`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h2 className="text-sm font-semibold text-text-primary group-hover:text-interactive-primary transition-colors duration-fast">
                      {subject.subject_name}
                    </h2>
                    <Badge variant={variant} showIcon>
                      {label}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    {subject.exam_board} &middot; {LEVEL_LABELS[subject.level]}
                  </p>
                  {lastPracticed && (
                    <p className="text-xs text-text-tertiary mt-1">
                      Last practised {lastPracticed}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
