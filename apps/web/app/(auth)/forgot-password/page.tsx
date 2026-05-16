/**
 * Forgot password page — sends a reset link to the user's email.
 */

"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authForgotPassword, RevizrApiError } from "@/lib/api";

// Note: metadata cannot be exported from a "use client" component.
// The parent (auth layout) sets the fallback title via template.

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>();

  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Enter a valid email address.";
    return undefined;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(undefined);

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError(undefined);

    setIsLoading(true);
    try {
      await authForgotPassword(email.trim());
      setSubmitted(true);
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

  if (submitted) {
    return (
      <Alert variant="success">
        <p className="font-semibold">Check your inbox</p>
        <p className="mt-1 text-sm">
          We&rsquo;ve sent a password reset link to <strong>{email}</strong>. It
          expires in 1 hour.
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Input
        id="forgot-email"
        type="email"
        label="Email address"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError(validateEmail(e.target.value));
        }}
        onBlur={() => setEmailError(validateEmail(email))}
        errorMessage={emailError}
        placeholder="you@example.com"
      />

      <Button type="submit" isLoading={isLoading} disabled={isLoading}>
        Send reset link
      </Button>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Forgot your password?
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your email address and we&rsquo;ll send you a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-sm text-center text-text-secondary">
        Remembered it?{" "}
        <a
          href="/login"
          className="text-text-link font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
        >
          Sign in
        </a>
      </p>
    </>
  );
}
