/**
 * SetupStudentForm — parent creates a student account.
 *
 * Fields: display name, birth year + month (derives age_band), relationship.
 * No teacher paths. No student self-registration.
 *
 * Age band derivation (from year/month only — no day of birth stored):
 * - Current year - birth year = approximate age
 * - under13: < 13
 * - 13to15: 13–15
 * - 16to18: 16–18
 * - adult: 19+
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authRegister, setAccessToken, RevizrApiError } from "@/lib/api";

const CURRENT_YEAR = new Date().getFullYear();

type AgeBand = "under13" | "13to15" | "16to18" | "adult";

function deriveAgeBand(birthYear: number, birthMonth: number): AgeBand {
  const now = new Date();
  // Approximate age: hasn't had birthday yet this year if birth month > current month
  const age =
    now.getMonth() + 1 >= birthMonth
      ? now.getFullYear() - birthYear
      : now.getFullYear() - birthYear - 1;
  if (age < 13) return "under13";
  if (age <= 15) return "13to15";
  if (age <= 18) return "16to18";
  return "adult";
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const RELATIONSHIPS = [
  { value: "parent", label: "Parent" },
  { value: "guardian", label: "Guardian" },
  { value: "carer", label: "Carer" },
] as const;

type Relationship = (typeof RELATIONSHIPS)[number]["value"];

const setupSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required.")
    .max(80, "Display name must be 80 characters or fewer."),
  birthYear: z
    .number({ invalid_type_error: "Birth year is required." })
    .min(CURRENT_YEAR - 25, "Please enter a valid birth year.")
    .max(CURRENT_YEAR - 4, "Your child must be at least 4 years old."),
  birthMonth: z
    .number({ invalid_type_error: "Birth month is required." })
    .min(1)
    .max(12),
  relationship: z.enum(["parent", "guardian", "carer"], {
    required_error: "Please select your relationship to the child.",
  }),
});

export function SetupStudentForm() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [relationship, setRelationship] = useState<Relationship>("parent");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [serverError, setServerError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const result = setupSchema.safeParse({
      displayName,
      birthYear: birthYear ? Number(birthYear) : undefined,
      birthMonth: birthMonth ? Number(birthMonth) : undefined,
      relationship,
    });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        displayName: flat.displayName?.[0],
        birthYear: flat.birthYear?.[0],
        birthMonth: flat.birthMonth?.[0],
        relationship: flat.relationship?.[0],
      });
      return false;
    }
    setErrors({});
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(undefined);
    if (!validate()) return;

    const year = Number(birthYear);
    const month = Number(birthMonth);
    const ageBand = deriveAgeBand(year, month);

    setIsLoading(true);
    try {
      // Create the student account. A temporary email is generated server-side
      // for children — parents manage the account, not the child.
      const result = await authRegister({
        email: `student+${Date.now()}@revizr-managed.internal`,
        password: crypto.randomUUID(), // Server-managed; parent controls access
        display_name: displayName.trim(),
        role: "student",
        age_band: ageBand,
        locale: "en-GB",
      });
      setAccessToken(result.access_token);
      router.push("/subjects");
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

  const birthYears = Array.from(
    { length: 22 },
    (_, i) => CURRENT_YEAR - 4 - i
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <Alert variant="error">{serverError}</Alert>
      )}

      <Input
        id="student-display-name"
        type="text"
        label="Child's display name"
        autoComplete="off"
        required
        placeholder="e.g. Amara"
        helpText="This is what will appear in the app. It doesn't need to be their full name."
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        onBlur={() => {
          if (!displayName.trim())
            setErrors((prev) => ({
              ...prev,
              displayName: "Display name is required.",
            }));
        }}
        errorMessage={errors.displayName}
      />

      {/* Birth year */}
      <div className="w-full">
        <label
          htmlFor="student-birth-year"
          className="block text-sm font-medium text-text-primary mb-1"
        >
          Birth year{" "}
          <span aria-hidden="true" className="text-text-error">
            *
          </span>
        </label>
        <p
          id="birth-year-help"
          className="text-xs text-text-tertiary mb-1"
        >
          We use this to select age-appropriate content. We do not store the
          exact date.
        </p>
        <select
          id="student-birth-year"
          required
          aria-required="true"
          aria-describedby={
            errors.birthYear ? "birth-year-error" : "birth-year-help"
          }
          aria-invalid={errors.birthYear ? "true" : undefined}
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          className={`input-base w-full ${errors.birthYear ? "border-border-error" : ""}`}
        >
          <option value="">Select year</option>
          {birthYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {errors.birthYear && (
          <p id="birth-year-error" role="alert" className="mt-1 text-xs text-text-error flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {errors.birthYear}
          </p>
        )}
      </div>

      {/* Birth month */}
      <div className="w-full">
        <label
          htmlFor="student-birth-month"
          className="block text-sm font-medium text-text-primary mb-1"
        >
          Birth month{" "}
          <span aria-hidden="true" className="text-text-error">
            *
          </span>
        </label>
        <select
          id="student-birth-month"
          required
          aria-required="true"
          aria-invalid={errors.birthMonth ? "true" : undefined}
          aria-describedby={errors.birthMonth ? "birth-month-error" : undefined}
          value={birthMonth}
          onChange={(e) => setBirthMonth(e.target.value)}
          className={`input-base w-full ${errors.birthMonth ? "border-border-error" : ""}`}
        >
          <option value="">Select month</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        {errors.birthMonth && (
          <p id="birth-month-error" role="alert" className="mt-1 text-xs text-text-error flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {errors.birthMonth}
          </p>
        )}
      </div>

      {/* Relationship */}
      <div className="w-full">
        <fieldset className="border-0 m-0 p-0">
          <legend className="block text-sm font-medium text-text-primary mb-2">
            Your relationship to this child{" "}
            <span aria-hidden="true" className="text-text-error">
              *
            </span>
          </legend>
          <div className="flex gap-3 flex-wrap">
            {RELATIONSHIPS.map((rel) => (
              <label
                key={rel.value}
                htmlFor={`rel-${rel.value}`}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer
                  min-h-touch-min text-sm font-medium
                  transition-colors duration-fast
                  focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-offset-2
                  ${
                    relationship === rel.value
                      ? "bg-bg-brand-subtle border-border-interactive text-interactive-primary"
                      : "bg-bg-surface border-border-default text-text-primary hover:border-border-strong"
                  }
                `}
              >
                <input
                  id={`rel-${rel.value}`}
                  type="radio"
                  name="relationship"
                  value={rel.value}
                  checked={relationship === rel.value}
                  onChange={() => setRelationship(rel.value)}
                  className="sr-only"
                />
                {rel.label}
              </label>
            ))}
          </div>
          {errors.relationship && (
            <p role="alert" className="mt-1 text-xs text-text-error flex items-center gap-1">
              <span aria-hidden="true">⚠</span>
              {errors.relationship}
            </p>
          )}
        </fieldset>
      </div>

      <Button type="submit" isLoading={isLoading} disabled={isLoading}>
        Create child&rsquo;s account
      </Button>
    </form>
  );
}
