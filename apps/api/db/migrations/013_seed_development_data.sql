-- DEVELOPMENT SEED DATA — DO NOT RUN IN PRODUCTION
-- This migration seeds sample questions for local development.
-- Real exam content requires licence clearance per board (see exam_boards_config).
-- In production, set board_licence_cleared = TRUE only after licence confirmation.

-- =============================================================================
-- Migration: 013_seed_development_data.sql
-- Purpose:   Seeds one SAMPLE exam board and 20 sample questions so a developer
--            can run the full app flow (diagnostic, practice, progress) on a clean
--            database without needing real exam board licences.
--
--            All question_text values are prefixed "[SAMPLE]" so they are never
--            mistaken for licensed exam content. They are clearly development-only.
--
--            The SAMPLE board is seeded with board_licence_cleared = TRUE so the
--            full question-serving flow can be exercised end-to-end in development.
--            Real boards remain FALSE until DPO confirms a signed licence (C-003).
-- =============================================================================

-- ============================================================
-- UP
-- ============================================================

-- ── Fix: add unique constraint required by ON CONFLICT clauses in the diagnostic worker ──
-- The diagnostic.worker.ts and the quiz route both use:
--   ON CONFLICT (diagnostic_session_id, topic_tag)
-- This constraint was missing from migration 006. Adding it here to unblock the worker.

ALTER TABLE diagnostic_results
    ADD CONSTRAINT diagnostic_results_session_topic_unique
    UNIQUE (diagnostic_session_id, topic_tag);

-- ── Exam board: SAMPLE (development only) ────────────────────────────────────

INSERT INTO exam_boards_config (
    id,
    board_code,
    board_name,
    board_licence_cleared,
    licence_cleared_at,
    licence_reference
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SAMPLE',
    'Sample Questions (Development Only)',
    TRUE,
    NOW(),
    'dev-seed-data-not-for-production'
)
ON CONFLICT (board_code) DO NOTHING;

-- ── Sample questions ──────────────────────────────────────────────────────────
-- 20 questions across Mathematics, English, Biology
-- Levels: gcse, ks3, alevel
-- question_type: multiple_choice or short_answer
-- board_licence_cleared = TRUE (set on the individual question column from migration 012)

-- Mathematics — GCSE

INSERT INTO questions (board_id, level, subject, year, paper_ref, topic_tags, question_text, mark_scheme_text, max_marks, question_type, board_licence_cleared)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Mathematics',
    2024,
    'SAMPLE-MATHS-1',
    ARRAY['algebra'],
    '[SAMPLE] Solve for x: 3x + 7 = 22',
    'x = 5. Award 1 mark for correct answer. Accept working shown: 3x = 15, x = 5.',
    1,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Mathematics',
    2024,
    'SAMPLE-MATHS-2',
    ARRAY['algebra'],
    '[SAMPLE] Expand and simplify: (x + 3)(x - 2)',
    'x² + x - 6. Award 2 marks for fully correct expansion. Award 1 mark if three out of four terms correct before simplification.',
    2,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'ks3',
    'Mathematics',
    2024,
    'SAMPLE-MATHS-3',
    ARRAY['fractions'],
    '[SAMPLE] Work out: 3/4 + 1/6. Give your answer as a simplified fraction.',
    '11/12. Award 1 mark for correct common denominator (12). Award 1 mark for correct final answer.',
    2,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Mathematics',
    2024,
    'SAMPLE-MATHS-4',
    ARRAY['fractions'],
    '[SAMPLE] A recipe uses 2/5 of a bag of flour. If a full bag weighs 1.5 kg, how many grams of flour are used?',
    '600 g. Award 1 mark for correct method (1500 × 2/5). Award 1 mark for correct answer in grams.',
    2,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'alevel',
    'Mathematics',
    2024,
    'SAMPLE-MATHS-5',
    ARRAY['trigonometry'],
    '[SAMPLE] Find all values of θ in the range 0° ≤ θ < 360° for which sin θ = √3/2.',
    'θ = 60° and θ = 120°. Award 1 mark for first correct value. Award 1 mark for second correct value.',
    2,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Mathematics',
    2024,
    'SAMPLE-MATHS-6',
    ARRAY['trigonometry'],
    '[SAMPLE] In a right-angled triangle, the hypotenuse is 10 cm and one angle is 35°. Find the length of the opposite side to 2 decimal places.',
    '5.74 cm. Award 1 mark for correct trigonometric ratio (sin 35° = opposite/10). Award 1 mark for correct calculation.',
    2,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Mathematics',
    2024,
    'SAMPLE-MATHS-7',
    ARRAY['statistics'],
    '[SAMPLE] The mean of 5 numbers is 8. Four of the numbers are 6, 9, 7, and 10. What is the fifth number?',
    '8. Award 1 mark for correct working (5 × 8 = 40; 40 − 6 − 9 − 7 − 10 = 8). Award 1 mark for correct answer.',
    2,
    'short_answer',
    TRUE
);

-- English — GCSE and KS3

INSERT INTO questions (board_id, level, subject, year, paper_ref, topic_tags, question_text, mark_scheme_text, max_marks, question_type, board_licence_cleared)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'English',
    2024,
    'SAMPLE-ENG-1',
    ARRAY['grammar'],
    '[SAMPLE] Identify the subordinate clause in the following sentence: "Although it was raining heavily, the match continued as planned."',
    '"Although it was raining heavily". Award 1 mark for correctly identifying the subordinate clause. Do not accept the main clause.',
    1,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'English',
    2024,
    'SAMPLE-ENG-2',
    ARRAY['grammar'],
    '[SAMPLE] Which sentence uses a semicolon correctly? A) The dog barked; the cat ran away. B) The dog; barked at the cat. C) The dog barked the; cat ran away.',
    'A) "The dog barked; the cat ran away." Award 1 mark for correct answer A. A semicolon correctly joins two independent clauses.',
    1,
    'multiple_choice',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'ks3',
    'English',
    2024,
    'SAMPLE-ENG-3',
    ARRAY['comprehension'],
    '[SAMPLE] Read the following passage and explain in one sentence what the writer''s main purpose appears to be: "Every year, millions of tonnes of plastic enter our oceans. Marine life suffers greatly as a result. We must act now before it is too late."',
    'Accept any response that identifies the writer is persuading the reader to take action to prevent ocean plastic pollution. Award 1 mark for a clear, accurate purpose statement.',
    1,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'English',
    2024,
    'SAMPLE-ENG-4',
    ARRAY['comprehension'],
    '[SAMPLE] What language technique is used in: "The thunder roared its anger across the sky"? Name the technique and explain its effect.',
    'Personification. Award 1 mark for correctly identifying personification. Award 1 mark for a relevant explanation of effect, e.g. "makes the thunder seem threatening or alive".',
    2,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'English',
    2024,
    'SAMPLE-ENG-5',
    ARRAY['creative_writing'],
    '[SAMPLE] Write the opening paragraph of a story that begins with the line: "The key had always been there, but nobody had ever asked what it opened."',
    'Mark for: engaging opening, use of narrative hook, appropriate tone and vocabulary. Up to 5 marks. Award full marks for a compelling, well-structured opening paragraph with varied sentence structures and effective vocabulary choices.',
    5,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'English',
    2024,
    'SAMPLE-ENG-6',
    ARRAY['poetry'],
    '[SAMPLE] In poetry, what is the term for the repetition of the same consonant sound at the beginning of closely connected words, as in "Peter Piper picked a peck"?',
    'Alliteration. Award 1 mark for correct answer.',
    1,
    'multiple_choice',
    TRUE
);

-- Biology — GCSE and A-level

INSERT INTO questions (board_id, level, subject, year, paper_ref, topic_tags, question_text, mark_scheme_text, max_marks, question_type, board_licence_cleared)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Biology',
    2024,
    'SAMPLE-BIO-1',
    ARRAY['cells'],
    '[SAMPLE] Name two structures found in plant cells but NOT in animal cells.',
    'Any two from: cell wall, chloroplast, large permanent vacuole. Award 1 mark for each correct structure (up to 2 marks).',
    2,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Biology',
    2024,
    'SAMPLE-BIO-2',
    ARRAY['cells'],
    '[SAMPLE] What is the function of mitochondria in a cell?',
    'Site of (aerobic) respiration. Award 1 mark. Accept: where energy (ATP) is produced / released from glucose.',
    1,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Biology',
    2024,
    'SAMPLE-BIO-3',
    ARRAY['genetics'],
    '[SAMPLE] A pea plant with genotype Tt is crossed with a plant of genotype tt. What percentage of offspring would be expected to have the tall phenotype? (T = tall allele, dominant; t = short allele, recessive)',
    '50%. Award 1 mark for correct Punnett square or working (Tt × tt produces Tt and tt in equal ratio). Award 1 mark for correct percentage.',
    2,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'alevel',
    'Biology',
    2024,
    'SAMPLE-BIO-4',
    ARRAY['genetics'],
    '[SAMPLE] Describe how meiosis results in genetic variation in offspring. Give two ways.',
    'Award up to 4 marks from: (1) Independent assortment of homologous chromosomes during meiosis I produces different combinations of maternal and paternal chromosomes in daughter cells. (2) Crossing over during prophase I: non-sister chromatids of homologous chromosomes exchange segments, producing new allele combinations (recombinant chromosomes).',
    4,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Biology',
    2024,
    'SAMPLE-BIO-5',
    ARRAY['evolution'],
    '[SAMPLE] State what is meant by the term "natural selection".',
    'The process by which organisms with favourable adaptations (characteristics) are more likely to survive, reproduce and pass on their genes (alleles) to offspring. Award up to 2 marks for a complete definition including: variation exists in population AND better-adapted individuals survive/reproduce more.',
    2,
    'short_answer',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Biology',
    2024,
    'SAMPLE-BIO-6',
    ARRAY['evolution'],
    '[SAMPLE] Which scientist is credited with proposing the theory of evolution by natural selection? A) Gregor Mendel B) Charles Darwin C) Louis Pasteur D) Francis Crick',
    'B) Charles Darwin. Award 1 mark for correct answer.',
    1,
    'multiple_choice',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000001',
    'gcse',
    'Biology',
    2024,
    'SAMPLE-BIO-7',
    ARRAY['cells'],
    '[SAMPLE] Which organelle is responsible for photosynthesis in plant cells? A) Nucleus B) Mitochondria C) Chloroplast D) Ribosome',
    'C) Chloroplast. Award 1 mark for correct answer.',
    1,
    'multiple_choice',
    TRUE
);

-- ============================================================
-- DOWN
-- ============================================================

-- Delete sample questions first (FK → exam_boards_config)
DELETE FROM questions
WHERE board_id = '00000000-0000-0000-0000-000000000001';

-- Delete the SAMPLE board
DELETE FROM exam_boards_config
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Remove the unique constraint added in UP
ALTER TABLE diagnostic_results
    DROP CONSTRAINT IF EXISTS diagnostic_results_session_topic_unique;
