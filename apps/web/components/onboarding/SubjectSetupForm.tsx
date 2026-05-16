/**
 * SubjectSetupForm — student selects subjects + exam boards + levels.
 *
 * Up to 10 subjects. For each: exam board + level.
 * On success → redirect to /diagnostic.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { createSubject, RevizrApiError, type Subject } from "@/lib/api";

const EXAM_BOARDS = ["AQA", "Edexcel", "OCR", "CCEA", "WJEC", "Cambridge"] as const;
type ExamBoard = (typeof EXAM_BOARDS)[number];

const LEVELS: { value: Subject["level"]; label: string }[] = [
  { value: "11plus", label: "11+" },
  { value: "ks3", label: "KS3" },
  { value: "gcse", label: "GCSE" },
  { value: "alevel", label: "A-level" },
];

const SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "English Language",
  "English Literature",
  "Biology",
  "Chemistry",
  "Physics",
  "History",
  "Geography",
  "French",
  "Spanish",
  "German",
  "Computer Science",
  "Religious Studies",
  "Art & Design",
  "Music",
  "Physical Education",
  "Business Studies",
  "Economics",
  "Psychology",
];

const MAX_SUBJECTS = 10;

interface SubjectEntry {
  id: string;
  subjectName: string;
  examBoard: ExamBoard;
  level: Subject["level"];
}

function newEntry(): SubjectEntry {
  return {
    id: crypto.randomUUID(),
    subjectName: "",
    examBoard: "AQA",
    level: "gcse",
  };
}

export function SubjectSetupForm() {
  const router = useRouter();
  const [entries, setEntries] = useState<SubjectEntry[]>([newEntry()]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [serverError, setServerError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  function updateEntry(id: string, patch: Partial<SubjectEntry>) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
    // Clear error for this entry on update
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  }

  function addEntry() {
    if (entries.length >= MAX_SUBJECTS) return;
    setEntries((prev) => [...prev, newEntry()]);
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function validate(): boolean {
    const newErrors: Record<string, string | undefined> = {};
    for (const entry of entries) {
      if (!entry.subjectName.trim()) {
        newErrors[entry.id] = "Subject name is required.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(undefined);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await Promise.all(
        entries.map((entry) =>
          createSubject({
            subject_name: entry.subjectName.trim(),
            exam_board: entry.examBoard,
            level: entry.level,
          })
        )
      );
      router.push("/diagnostic");
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        setServerError(ex.apiError.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {serverError && (
        <Alert variant="error">{serverError}</Alert>
      )}

      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider mt-0.5">
                Subject {i + 1}
              </span>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  aria-label={`Remove subject ${i + 1}: ${entry.subjectName || "unnamed"}`}
                  className="
                    text-xs text-text-tertiary hover:text-text-error
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                    rounded-sm
                  "
                >
                  Remove
                </button>
              )}
            </div>

            {/* Subject name */}
            <div className="w-full">
              <label
                htmlFor={`subject-name-${entry.id}`}
                className="block text-sm font-medium text-text-primary mb-1"
              >
                Subject name{" "}
                <span aria-hidden="true" className="text-text-error">
                  *
                </span>
              </label>
              <input
                id={`subject-name-${entry.id}`}
                type="text"
                list={`subject-suggestions-${entry.id}`}
                required
                aria-required="true"
                aria-invalid={errors[entry.id] ? "true" : undefined}
                aria-describedby={
                  errors[entry.id] ? `subject-error-${entry.id}` : undefined
                }
                placeholder="e.g. Mathematics"
                value={entry.subjectName}
                onChange={(e) =>
                  updateEntry(entry.id, { subjectName: e.target.value })
                }
                className={`input-base w-full ${errors[entry.id] ? "border-border-error" : ""}`}
              />
              <datalist id={`subject-suggestions-${entry.id}`}>
                {SUBJECT_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {errors[entry.id] && (
                <p
                  id={`subject-error-${entry.id}`}
                  role="alert"
                  className="mt-1 text-xs text-text-error flex items-center gap-1"
                >
                  <span aria-hidden="true">⚠</span>
                  {errors[entry.id]}
                </p>
              )}
            </div>

            {/* Exam board */}
            <div className="w-full">
              <label
                htmlFor={`exam-board-${entry.id}`}
                className="block text-sm font-medium text-text-primary mb-1"
              >
                Exam board
              </label>
              <select
                id={`exam-board-${entry.id}`}
                value={entry.examBoard}
                onChange={(e) =>
                  updateEntry(entry.id, {
                    examBoard: e.target.value as ExamBoard,
                  })
                }
                className="input-base w-full"
              >
                {EXAM_BOARDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <fieldset className="border-0 m-0 p-0">
              <legend className="text-sm font-medium text-text-primary mb-2">
                Level
              </legend>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((lvl) => (
                  <label
                    key={lvl.value}
                    htmlFor={`level-${entry.id}-${lvl.value}`}
                    className={`
                      flex items-center justify-center
                      px-3 py-2 rounded-md border cursor-pointer
                      text-sm font-medium min-h-touch-min
                      transition-colors duration-fast
                      focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-offset-2
                      ${
                        entry.level === lvl.value
                          ? "bg-bg-brand-subtle border-border-interactive text-interactive-primary"
                          : "bg-bg-surface border-border-default text-text-primary hover:border-border-strong"
                      }
                    `}
                  >
                    <input
                      id={`level-${entry.id}-${lvl.value}`}
                      type="radio"
                      name={`level-${entry.id}`}
                      value={lvl.value}
                      checked={entry.level === lvl.value}
                      onChange={() =>
                        updateEntry(entry.id, { level: lvl.value })
                      }
                      className="sr-only"
                    />
                    {lvl.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ))}
      </div>

      {entries.length < MAX_SUBJECTS && (
        <button
          type="button"
          onClick={addEntry}
          className="
            w-full py-3 border-2 border-dashed border-border-default rounded-lg
            text-sm text-text-tertiary hover:border-border-strong hover:text-text-secondary
            transition-colors duration-fast
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
            focus-visible:ring-offset-2
            min-h-touch-min
          "
        >
          + Add another subject
        </button>
      )}

      <p className="text-xs text-text-tertiary">
        You can add more subjects or change these settings later.
      </p>

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Save subjects and continue
      </Button>
    </form>
  );
}
