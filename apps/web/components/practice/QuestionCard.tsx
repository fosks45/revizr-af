/**
 * QuestionCard — renders a practice question.
 *
 * - Question text (may contain MathML — rendered as-is)
 * - Image if image_refs present (with accessible alt text)
 * - Board, level, topic tags displayed as metadata
 *
 * WCAG: D1 — alt text required for informational images.
 */

import type { Question } from "@/lib/api";

interface QuestionCardProps {
  question: Question;
}

const LEVEL_LABELS: Record<Question["level"], string> = {
  "11plus": "11+",
  ks3: "KS3",
  gcse: "GCSE",
  alevel: "A-level",
};

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <article
      aria-label={`Question: ${question.question_text.slice(0, 80)}`}
      className="bg-bg-surface border border-border-default rounded-lg p-6 space-y-4"
    >
      {/* Metadata */}
      <div className="flex flex-wrap gap-2 text-xs text-text-tertiary">
        <span>
          {question.board} &middot; {LEVEL_LABELS[question.level]}
        </span>
        {question.subject && (
          <span>&middot; {question.subject}</span>
        )}
        {question.year && <span>&middot; {question.year}</span>}
        {question.paper_ref && <span>&middot; {question.paper_ref}</span>}
        <span className="ml-auto font-medium text-text-secondary">
          {question.max_marks} mark{question.max_marks !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Question text — MathML rendered as-is */}
      <div
        className="text-sm text-text-primary leading-relaxed"
        /* MathML content is trusted (server-generated from verified question bank) */
        dangerouslySetInnerHTML={{ __html: question.question_text }}
      />

      {/* Images */}
      {question.image_refs && question.image_refs.length > 0 && (
        <div className="space-y-3">
          {question.image_refs.map((ref, i) => (
            <figure key={ref} className="max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ref}
                alt={`Figure ${i + 1} for this question`}
                className="max-w-full rounded border border-border-default"
                loading="lazy"
              />
              <figcaption className="sr-only">
                Figure {i + 1} associated with this question
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* Topic tags */}
      {question.topic_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-border-default">
          {question.topic_tags.map((tag) => (
            <span
              key={tag}
              className="
                px-2 py-0.5 text-xs
                bg-bg-surface-overlay text-text-tertiary
                rounded-sm
              "
            >
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
