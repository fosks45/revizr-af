/**
 * Practice session page — focused mode (no nav chrome).
 *
 * WCAG:
 * - <main tabIndex={-1}> for focus management on question change
 * - SelfMarkControls: each button labelled "Award N mark(s)"
 * - MarkSchemeReveal: aria-expanded, smooth transition (respects prefers-reduced-motion)
 * - Progress indicator: "Question N of M"
 */

"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { SelfMarkControls } from "@/components/practice/SelfMarkControls";
import { MarkSchemeReveal } from "@/components/practice/MarkSchemeReveal";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  getPersonalisedQuestions,
  createPracticeSession,
  submitQuestionAttempt,
  updatePracticeSession,
  type Question,
  type PracticeSession,
  RevizrApiError,
} from "@/lib/api";

function useSessionTimer() {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

type SessionPhase = "loading" | "answering" | "marking" | "complete" | "error";

function PracticeSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subjectId = searchParams.get("subject_id") ?? "";
  const mainRef = useRef<HTMLElement | null>(null);

  const [phase, setPhase] = useState<SessionPhase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markSchemeRevealed, setMarkSchemeRevealed] = useState(false);
  const [selectedMark, setSelectedMark] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const timer = useSessionTimer();

  useEffect(() => {
    async function loadSession() {
      if (!subjectId) {
        router.push("/practice");
        return;
      }
      try {
        const { questions: qs } = await getPersonalisedQuestions({
          subject_id: subjectId,
          count: 10,
        });
        if (qs.length === 0) {
          setError("No questions available for this subject right now.");
          setPhase("error");
          return;
        }
        const sess = await createPracticeSession({
          subject_id: subjectId,
          question_ids: qs.map((q) => q.id),
        });
        setQuestions(qs);
        setSession(sess);
        setPhase("answering");
        setQuestionStartTime(Date.now());
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        } else {
          setError("Unable to start your session. Please try again.");
          setPhase("error");
        }
      }
    }
    void loadSession();
  }, [subjectId, router]);

  // Move focus to <main> when question changes (WCAG 2.4.3)
  useEffect(() => {
    if (phase === "answering") {
      mainRef.current?.focus();
    }
  }, [currentIndex, phase]);

  async function handleMarkSubmit(mark: number) {
    if (!session) return;
    setSelectedMark(mark);
    setMarkSchemeRevealed(true);
    setPhase("marking");

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    try {
      await submitQuestionAttempt(session.id, {
        question_id: questions[currentIndex].id,
        self_mark_score: mark,
        time_spent_seconds: timeSpent,
        mark_scheme_viewed: true,
      });
    } catch {
      // Non-fatal — continue session even if attempt submission fails
    }
  }

  async function handleNext() {
    const nextIndex = currentIndex + 1;
    setMarkSchemeRevealed(false);
    setSelectedMark(null);

    if (nextIndex >= questions.length) {
      // End session
      if (session) {
        try {
          await updatePracticeSession(session.id, "completed");
        } catch {
          // Non-fatal
        }
      }
      setPhase("complete");
    } else {
      setCurrentIndex(nextIndex);
      setPhase("answering");
      setQuestionStartTime(Date.now());
    }
  }

  async function handleEndSession() {
    if (session) {
      try {
        await updatePracticeSession(session.id, "abandoned");
      } catch {
        // Non-fatal
      }
    }
    router.push("/dashboard");
  }

  const currentQuestion = questions[currentIndex] ?? null;
  const progressPct =
    questions.length > 0
      ? Math.round((currentIndex / questions.length) * 100)
      : 0;

  // Focused mode: cover the entire viewport including nav chrome.
  // Uses a fixed overlay so the nav header/sidebar/bottom-tabs are hidden.
  return (
    <div
      ref={(el) => {
        mainRef.current = el as HTMLElement | null;
      }}
      className="fixed inset-0 z-overlay flex flex-col bg-bg-page overflow-y-auto"
      aria-label="Practice session"
    >
        {phase === "loading" && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-tertiary text-sm" aria-live="polite">
              Loading questions…
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="page-container py-8">
            <Alert variant="error">{error}</Alert>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => router.push("/practice")}>
                Back to subjects
              </Button>
            </div>
          </div>
        )}

        {(phase === "answering" || phase === "marking") && currentQuestion && (
          <div className="flex flex-col flex-1 page-container py-6 gap-6">
            {/* Header: progress + timer */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Progress
                  value={progressPct}
                  aria-label={`Question ${currentIndex + 1} of ${questions.length}`}
                  variant="default"
                />
                <p className="text-xs text-text-tertiary mt-1">
                  Question{" "}
                  <strong>
                    {currentIndex + 1} of {questions.length}
                  </strong>
                </p>
              </div>
              <div
                aria-label={`Session time: ${timer}`}
                className="text-xs text-text-tertiary font-mono shrink-0"
              >
                {timer}
              </div>
            </div>

            {/* Question */}
            <QuestionCard question={currentQuestion} />

            {/* Self-mark (shown after answering) */}
            {phase === "answering" && (
              <section aria-labelledby="mark-heading">
                <h2
                  id="mark-heading"
                  className="text-sm font-semibold text-text-primary mb-3"
                >
                  How did you do?
                </h2>
                <p className="text-xs text-text-secondary mb-4">
                  Be honest — this helps us find the right questions for you.
                </p>
                <SelfMarkControls
                  maxMarks={currentQuestion.max_marks}
                  onMark={handleMarkSubmit}
                />
              </section>
            )}

            {/* Mark scheme + next */}
            {phase === "marking" && (
              <div className="space-y-4">
                <MarkSchemeReveal
                  markSchemeText={
                    currentQuestion.mark_scheme_text ?? "No mark scheme available."
                  }
                  revealed={markSchemeRevealed}
                  onReveal={() => setMarkSchemeRevealed(true)}
                />

                {selectedMark !== null && (
                  <p
                    className="text-sm text-text-secondary"
                    aria-live="polite"
                  >
                    You awarded yourself{" "}
                    <strong>
                      {selectedMark} / {currentQuestion.max_marks}
                    </strong>
                    .
                  </p>
                )}

                <Button onClick={handleNext}>
                  {currentIndex + 1 >= questions.length
                    ? "Finish session"
                    : "Next question"}
                </Button>
              </div>
            )}

            {/* End session link */}
            <div className="mt-auto pt-4 border-t border-border-default">
              <button
                type="button"
                onClick={handleEndSession}
                className="
                  text-xs text-text-tertiary hover:text-text-secondary
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                  rounded-sm underline-offset-2 hover:underline
                "
              >
                End session early
              </button>
            </div>
          </div>
        )}

        {phase === "complete" && (
          <div className="page-container py-12 text-center">
            <h1 className="text-xl font-bold text-text-primary mb-2">
              Session complete!
            </h1>
            <p className="text-sm text-text-secondary mb-8">
              Great work. Your progress has been saved.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button onClick={() => router.push("/practice")}>
                Start another session
              </Button>
              <Button variant="secondary" onClick={() => router.push("/dashboard")}>
                Back to dashboard
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}

export default function PracticeSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh">
          <p className="text-text-tertiary text-sm">Loading session…</p>
        </div>
      }
    >
      <PracticeSessionContent />
    </Suspense>
  );
}
