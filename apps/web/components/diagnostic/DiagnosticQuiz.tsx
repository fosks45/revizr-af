/**
 * DiagnosticQuiz — multi-step diagnostic quiz component.
 *
 * Steps:
 * 1. Subject select (from user's subjects)
 * 2. Confidence self-assessment per topic (one question per topic_tag)
 * 3. Submit → POST /diagnostic/quiz (synchronous — no polling needed)
 * 4. Complete → redirect to /diagnostic/results/:sessionId
 *
 * The quiz does not use the practice question bank. The student rates their
 * confidence per topic; the backend converts these to weakness scores directly
 * without a Claude API call (F3 path, no document upload required).
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Progress } from "@/components/ui/Progress";
import {
  listSubjects,
  submitDiagnosticQuiz,
  type Subject,
  RevizrApiError,
} from "@/lib/api";

type Phase =
  | "select-subject"
  | "quiz"
  | "submitting"
  | "complete"
  | "error";

// Topic tags used in the quiz. These must match the taxonomy used in
// questions.topic_tags and diagnostic_results.topic_tag.
const DIAGNOSTIC_TOPICS: Array<{ tag: string; label: string; subject: string }> = [
  // Mathematics
  { tag: "algebra", label: "Algebra", subject: "Mathematics" },
  { tag: "geometry", label: "Geometry & Shapes", subject: "Mathematics" },
  { tag: "trigonometry", label: "Trigonometry", subject: "Mathematics" },
  { tag: "fractions", label: "Fractions & Decimals", subject: "Mathematics" },
  { tag: "statistics", label: "Statistics & Probability", subject: "Mathematics" },
  // English
  { tag: "grammar", label: "Grammar & Punctuation", subject: "English" },
  { tag: "comprehension", label: "Reading Comprehension", subject: "English" },
  { tag: "creative_writing", label: "Creative Writing", subject: "English" },
  { tag: "poetry", label: "Poetry Analysis", subject: "English" },
  { tag: "media_language", label: "Media & Language", subject: "English" },
  // Biology
  { tag: "cells", label: "Cells & Organisation", subject: "Biology" },
  { tag: "genetics", label: "Genetics & Inheritance", subject: "Biology" },
  { tag: "evolution", label: "Evolution & Natural Selection", subject: "Biology" },
  { tag: "ecosystems", label: "Ecosystems & Interdependence", subject: "Biology" },
  { tag: "digestion", label: "Digestion & Nutrition", subject: "Biology" },
  // Physics
  { tag: "forces", label: "Forces & Motion", subject: "Physics" },
  { tag: "electricity", label: "Electricity & Circuits", subject: "Physics" },
  { tag: "waves", label: "Waves & Light", subject: "Physics" },
  // Chemistry
  { tag: "atomic_structure", label: "Atomic Structure", subject: "Chemistry" },
  { tag: "bonding", label: "Bonding & Structure", subject: "Chemistry" },
];

// Confidence values map to backend confidence: 1=very weak → 5=very confident
const CONFIDENCE_OPTIONS: Array<{ value: 1 | 2 | 3 | 4 | 5; label: string }> = [
  { value: 1, label: "Very weak" },
  { value: 2, label: "Weak" },
  { value: 3, label: "OK" },
  { value: 4, label: "Confident" },
  { value: 5, label: "Very confident" },
];

export function DiagnosticQuiz() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("select-subject");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers: topic_tag → confidence value (1-5)
  const [answers, setAnswers] = useState<Record<string, 1 | 2 | 3 | 4 | 5>>({});
  const [error, setError] = useState<string | undefined>();

  // Topics filtered to match the selected subject
  const [topics, setTopics] = useState<typeof DIAGNOSTIC_TOPICS>([]);

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

  function handleSubjectSelect() {
    if (!selectedSubjectId) return;
    const subject = subjects.find((s) => s.id === selectedSubjectId) ?? null;
    setSelectedSubject(subject);

    // Filter DIAGNOSTIC_TOPICS to those matching this subject name (case-insensitive).
    // Fall back to all topics if subject name doesn't match any group.
    const subjectName = subject?.subject_name ?? "";
    const matched = DIAGNOSTIC_TOPICS.filter(
      (t) => t.subject.toLowerCase() === subjectName.toLowerCase()
    );
    const topicList = matched.length >= 3 ? matched : DIAGNOSTIC_TOPICS.slice(0, 10);

    setTopics(topicList);
    setCurrentIndex(0);
    setAnswers({});
    setPhase("quiz");
  }

  async function handleQuizComplete() {
    if (!selectedSubjectId || topics.length === 0) return;
    setPhase("submitting");

    // Build responses array from answers
    const responses = topics.map((t) => ({
      topic_tag: t.tag,
      confidence: (answers[t.tag] ?? 3) as 1 | 2 | 3 | 4 | 5,
    }));

    try {
      const { sessionId } = await submitDiagnosticQuiz({
        subject_id: selectedSubjectId,
        responses,
      });
      // Session is immediately complete — redirect straight to results
      router.push(`/diagnostic/results/${sessionId}`);
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        setError(ex.apiError.message);
      } else {
        setError("Unable to submit quiz. Please try again.");
      }
      setPhase("error");
    }
  }

  function handleAnswer(topicTag: string, confidence: 1 | 2 | 3 | 4 | 5) {
    setAnswers((prev) => ({ ...prev, [topicTag]: confidence }));
  }

  function handleNext() {
    if (currentIndex + 1 >= topics.length) {
      void handleQuizComplete();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const currentTopic = topics[currentIndex];
  const currentAnswer = currentTopic ? answers[currentTopic.tag] : undefined;
  const progressPct =
    topics.length > 0
      ? Math.round((currentIndex / topics.length) * 100)
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

  if (phase === "quiz" && currentTopic) {
    return (
      <div className="space-y-6">
        {/* Progress */}
        <div>
          <Progress
            value={progressPct}
            aria-label={`Topic ${currentIndex + 1} of ${topics.length}`}
          />
          <p className="text-xs text-text-tertiary mt-1">
            Topic <strong>{currentIndex + 1}</strong> of{" "}
            <strong>{topics.length}</strong>
            {selectedSubject && (
              <span className="ml-2 text-text-tertiary">
                — {selectedSubject.subject_name}
              </span>
            )}
          </p>
        </div>

        {/* Topic confidence question */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <p className="text-xs text-text-tertiary mb-2 font-medium uppercase tracking-wider">
            {currentTopic.tag.replace(/_/g, " ")}
          </p>
          <p className="text-sm text-text-primary font-medium leading-relaxed">
            How confident are you with <strong>{currentTopic.label}</strong>?
          </p>
        </div>

        {/* Confidence rating */}
        <fieldset className="border-0 m-0 p-0">
          <legend className="sr-only">
            Confidence rating for {currentTopic.label}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {CONFIDENCE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                htmlFor={`conf-${currentTopic.tag}-${opt.value}`}
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
                  id={`conf-${currentTopic.tag}-${opt.value}`}
                  type="radio"
                  name={`confidence-${currentTopic.tag}`}
                  value={opt.value}
                  checked={currentAnswer === opt.value}
                  onChange={() => handleAnswer(currentTopic.tag, opt.value)}
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
          {currentIndex + 1 >= topics.length ? "Finish quiz" : "Next topic"}
        </Button>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="space-y-4" aria-live="polite" aria-atomic="true">
        <p className="text-sm font-semibold text-text-primary">
          Saving your results…
        </p>
        <Progress
          value={80}
          aria-label="Saving results"
          variant="default"
        />
        <p className="text-xs text-text-secondary">
          Building your topic map…
        </p>
      </div>
    );
  }

  return null;
}
