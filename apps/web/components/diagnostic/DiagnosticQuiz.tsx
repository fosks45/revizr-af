/**
 * DiagnosticQuiz — multi-step diagnostic quiz component.
 *
 * Steps:
 * 1. Subject select (from user's subjects)
 * 2. 10 diagnostic questions per selected subject
 * 3. Submit → shows "Analysing…" → polls GET /diagnostic/status/:jobId
 * 4. Complete → redirect to /diagnostic/results/:sessionId
 *
 * Note: The diagnostic quiz uses a simplified question format —
 * the student selects a self-assessment level per topic rather than
 * answering full exam questions. This is by design for the onboarding
 * diagnostic flow.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Progress } from "@/components/ui/Progress";
import {
  listSubjects,
  getPersonalisedQuestions,
  createPracticeSession,
  submitQuestionAttempt,
  updatePracticeSession,
  getJobStatus,
  type Subject,
  type Question,
  RevizrApiError,
} from "@/lib/api";

type Phase =
  | "select-subject"
  | "quiz"
  | "analysing"
  | "complete"
  | "error";

const CONFIDENCE_OPTIONS = [
  { value: 0, label: "Not confident at all" },
  { value: 1, label: "Slightly confident" },
  { value: 2, label: "Fairly confident" },
  { value: 3, label: "Very confident" },
];

export function DiagnosticQuiz() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("select-subject");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [analysingProgress, setAnalysingProgress] = useState(0);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      try {
        const { subjects: data } = await listSubjects();
        setSubjects(data.filter((s) => s.is_active));
      } catch {
        setError("Unable to load your subjects. Please refresh.");
        setPhase("error");
      }
    }
    void load();
  }, []);

  // Poll job status when analysing
  useEffect(() => {
    if (phase !== "analysing" || !jobId) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const status = await getJobStatus(jobId);
        if (cancelled) return;

        setAnalysingProgress(status.progress_pct ?? 50);

        if (status.status === "complete") {
          setPhase("complete");
          const sid = sessionId;
          if (sid) {
            localStorage.setItem("revizr_last_diagnostic_session_id", sid);
            router.push(`/diagnostic/results/${sid}`);
          }
        } else if (status.status === "failed") {
          setPhase("error");
          setError(status.error_message ?? "Analysis failed. Please try again.");
        } else {
          setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) {
          setTimeout(poll, 3000);
        }
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [phase, jobId, sessionId, router]);

  async function handleSubjectSelect() {
    if (!selectedSubjectId) return;

    try {
      const { questions: qs } = await getPersonalisedQuestions({
        subject_id: selectedSubjectId,
        count: 10,
      });
      setQuestions(qs);
      setCurrentIndex(0);
      setAnswers({});
      setPhase("quiz");
    } catch {
      setError("Unable to load questions. Please try again.");
      setPhase("error");
    }
  }

  async function handleQuizComplete() {
    if (!selectedSubjectId) return;
    setPhase("analysing");
    setAnalysingProgress(10);

    try {
      const sess = await createPracticeSession({
        subject_id: selectedSubjectId,
        question_ids: questions.map((q) => q.id),
      });
      setSessionId(sess.id);
      setJobId(sess.id); // Using session ID as job ID for polling

      // Submit all answers
      for (const [questionId, score] of Object.entries(answers)) {
        try {
          await submitQuestionAttempt(sess.id, {
            question_id: questionId,
            self_mark_score: score,
            time_spent_seconds: 30,
            mark_scheme_viewed: false,
          });
        } catch {
          // Non-fatal
        }
      }

      await updatePracticeSession(sess.id, "completed");
      setAnalysingProgress(30);
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        setError(ex.apiError.message);
      } else {
        setError("Unable to submit quiz. Please try again.");
      }
      setPhase("error");
    }
  }

  function handleAnswer(questionId: string, score: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      void handleQuizComplete();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const progressPct =
    questions.length > 0
      ? Math.round((currentIndex / questions.length) * 100)
      : 0;

  if (phase === "error") {
    return (
      <div className="space-y-4">
        <Alert variant="error">{error}</Alert>
        <Button variant="secondary" onClick={() => setPhase("select-subject")}>
          Start over
        </Button>
      </div>
    );
  }

  if (phase === "select-subject") {
    return (
      <div className="space-y-6">
        <div className="w-full">
          <label
            htmlFor="quiz-subject-select"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Which subject would you like to be assessed on?{" "}
            <span aria-hidden="true" className="text-text-error">
              *
            </span>
          </label>
          <select
            id="quiz-subject-select"
            required
            aria-required="true"
            value={selectedSubjectId ?? ""}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="input-base w-full"
          >
            <option value="">Select a subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name} — {s.exam_board}
              </option>
            ))}
          </select>
        </div>

        {subjects.length === 0 && (
          <Alert variant="info">
            You don&rsquo;t have any subjects yet.{" "}
            <a href="/subjects" className="underline font-medium">
              Add subjects first.
            </a>
          </Alert>
        )}

        <Button
          onClick={handleSubjectSelect}
          disabled={!selectedSubjectId || subjects.length === 0}
        >
          Start quiz
        </Button>
      </div>
    );
  }

  if (phase === "quiz" && currentQuestion) {
    return (
      <div className="space-y-6">
        {/* Progress */}
        <div>
          <Progress
            value={progressPct}
            aria-label={`Question ${currentIndex + 1} of ${questions.length}`}
          />
          <p className="text-xs text-text-tertiary mt-1">
            Question <strong>{currentIndex + 1}</strong> of{" "}
            <strong>{questions.length}</strong>
          </p>
        </div>

        {/* Question — simplified confidence assessment for diagnostic */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <p className="text-xs text-text-tertiary mb-2 font-medium uppercase tracking-wider">
            {currentQuestion.topic_tags.join(", ").replace(/_/g, " ")}
          </p>
          <p className="text-sm text-text-primary font-medium leading-relaxed">
            {currentQuestion.question_text}
          </p>
        </div>

        {/* Confidence rating */}
        <fieldset className="border-0 m-0 p-0">
          <legend className="text-sm font-semibold text-text-primary mb-3">
            How confident are you with this topic?
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONFIDENCE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                htmlFor={`conf-${currentQuestion.id}-${opt.value}`}
                className={`
                  flex items-center justify-center text-center
                  p-3 rounded-lg border cursor-pointer text-xs font-medium
                  min-h-touch-min
                  transition-colors duration-fast
                  focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-offset-2
                  ${
                    currentAnswer === opt.value
                      ? "bg-bg-brand-subtle border-border-interactive text-interactive-primary"
                      : "bg-bg-surface border-border-default text-text-primary hover:border-border-strong"
                  }
                `}
              >
                <input
                  id={`conf-${currentQuestion.id}-${opt.value}`}
                  type="radio"
                  name={`confidence-${currentQuestion.id}`}
                  value={opt.value}
                  checked={currentAnswer === opt.value}
                  onChange={() => handleAnswer(currentQuestion.id, opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Button
          onClick={handleNext}
          disabled={currentAnswer === undefined}
        >
          {currentIndex + 1 >= questions.length ? "Finish quiz" : "Next question"}
        </Button>
      </div>
    );
  }

  if (phase === "analysing") {
    return (
      <div className="space-y-4" aria-live="polite" aria-atomic="true">
        <p className="text-sm font-semibold text-text-primary">
          Analysing your results…
        </p>
        <Progress
          value={analysingProgress}
          aria-label="Analysing your results"
          variant="default"
        />
        <p className="text-xs text-text-secondary">
          We&rsquo;re building your topic map. This usually takes under a minute.
        </p>
      </div>
    );
  }

  return null;
}
