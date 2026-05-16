/**
 * Reset password page — accepts new password + confirm.
 * Reads the reset token from the `token` query parameter.
 */

"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authResetPassword, setAccessToken, RevizrApiError } from "@/lib/api";

const PASSWORD_HINT =
  "At least 10 characters, including uppercase, lowercase, and a number.";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  function validatePassword(v: string): string | undefined {
    if (!v) return "Password is required.";
    if (v.length < 10) return "Password must be at least 10 characters.";
    if (!/[A-Z]/.test(v)) return "Password must include an uppercase letter.";
    if (!/[a-z]/.test(v)) return "Password must include a lowercase letter.";
    if (!/[0-9]/.test(v)) return "Password must include a number.";
    return undefined;
  }

  function validateConfirm(pw: string, cf: string): string | undefined {
    if (!cf) return "Please confirm your password.";
    if (pw !== cf) return "Passwords do not match.";
    return undefined;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(undefined);

    const pErr = validatePassword(password);
    const cErr = validateConfirm(password, confirm);
    setPasswordError(pErr);
    setConfirmError(cErr);
    if (pErr || cErr) return;

    if (!token) {
      setServerError(
        "This reset link is missing a token. Please request a new one."
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await authResetPassword(token, password);
      setAccessToken(result.access_token);
      router.push("/dashboard");
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        if (ex.statusCode === 400 || ex.statusCode === 422) {
          setServerError(
            "This reset link is invalid or has expired. Please request a new one."
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

  if (!token) {
    return (
      <Alert variant="error">
        <p className="font-semibold">Missing reset token</p>
        <p className="mt-1 text-sm">
          This link is incomplete.{" "}
          <a href="/forgot-password" className="underline">
            Request a new reset link.
          </a>
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Input
        id="reset-password"
        type="password"
        label="New password"
        autoComplete="new-password"
        required
        helpText={PASSWORD_HINT}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError) setPasswordError(validatePassword(e.target.value));
        }}
        onBlur={() => setPasswordError(validatePassword(password))}
        errorMessage={passwordError}
      />

      <Input
        id="reset-confirm"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => {
          setConfirm(e.target.value);
          if (confirmError)
            setConfirmError(validateConfirm(password, e.target.value));
        }}
        onBlur={() => setConfirmError(validateConfirm(password, confirm))}
        errorMessage={confirmError}
      />

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Set new password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Reset your password
        </h1>
        <p className="text-sm text-text-secondary">
          Choose a strong new password for your account.
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-text-tertiary">Loading…</p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
