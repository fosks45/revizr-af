/**
 * Parent registration form — Zod client-side validation.
 *
 * Parent-only. No role selector. No student self-registration.
 *
 * WCAG: F1 labelled inputs, F2 aria-describedby errors, submit disabled until valid.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  authRegister,
  setAccessToken,
  RevizrApiError,
} from "@/lib/api";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    displayName: z
      .string()
      .min(1, "Display name is required.")
      .max(80, "Display name must be 80 characters or fewer."),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters.")
      .regex(/[A-Z]/, "Password must include an uppercase letter.")
      .regex(/[a-z]/, "Password must include a lowercase letter.")
      .regex(/[0-9]/, "Password must include a number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFields = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<keyof RegisterFields, string>>;

export function RegisterForm() {
  const router = useRouter();

  const [fields, setFields] = useState<RegisterFields>({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  function setField<K extends keyof RegisterFields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validateField(key: keyof RegisterFields) {
    const result = registerSchema.safeParse(fields);
    if (!result.success) {
      const fieldError = result.error.flatten().fieldErrors[key]?.[0];
      setErrors((prev) => ({ ...prev, [key]: fieldError }));
    } else {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const result = registerSchema.safeParse(fields);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        email: flat.email?.[0],
        displayName: flat.displayName?.[0],
        password: flat.password?.[0],
        confirmPassword: flat.confirmPassword?.[0],
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

    setIsLoading(true);
    try {
      const result = await authRegister({
        email: fields.email.trim(),
        password: fields.password,
        display_name: fields.displayName.trim(),
        role: "parent",
        age_band: "adult",
        locale: "en-GB",
      });
      setAccessToken(result.access_token);
      router.push("/setup");
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        if (ex.statusCode === 409) {
          setServerError(
            "An account with this email already exists. Sign in instead?"
          );
        } else {
          setServerError(ex.apiError.message);
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const hasErrors = Object.values(errors).some(Boolean);
  const allFilled = Object.values(fields).every((v) => v.length > 0);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <Alert variant="error">
          {serverError}{" "}
          {serverError.includes("already exists") && (
            <a href="/login" className="underline font-medium">
              Sign in
            </a>
          )}
        </Alert>
      )}

      <Input
        id="reg-display-name"
        type="text"
        label="Your name"
        autoComplete="name"
        required
        placeholder="e.g. Sarah"
        value={fields.displayName}
        onChange={(e) => setField("displayName", e.target.value)}
        onBlur={() => validateField("displayName")}
        errorMessage={errors.displayName}
      />

      <Input
        id="reg-email"
        type="email"
        label="Email address"
        autoComplete="email"
        required
        placeholder="you@example.com"
        value={fields.email}
        onChange={(e) => setField("email", e.target.value)}
        onBlur={() => validateField("email")}
        errorMessage={errors.email}
      />

      <Input
        id="reg-password"
        type="password"
        label="Password"
        autoComplete="new-password"
        required
        helpText="At least 10 characters, including uppercase, lowercase, and a number."
        value={fields.password}
        onChange={(e) => setField("password", e.target.value)}
        onBlur={() => validateField("password")}
        errorMessage={errors.password}
      />

      <Input
        id="reg-confirm-password"
        type="password"
        label="Confirm password"
        autoComplete="new-password"
        required
        value={fields.confirmPassword}
        onChange={(e) => setField("confirmPassword", e.target.value)}
        onBlur={() => validateField("confirmPassword")}
        errorMessage={errors.confirmPassword}
      />

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={isLoading || hasErrors || !allFilled}
      >
        Create account
      </Button>

      <p className="text-xs text-text-tertiary text-center">
        By creating an account you agree to our{" "}
        <a
          href="/terms"
          className="text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
        >
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
