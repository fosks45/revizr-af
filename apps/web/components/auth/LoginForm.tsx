/**
 * Email/password login form.
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authLogin, setAccessToken, RevizrApiError } from "@/lib/api";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFields = z.infer<typeof loginSchema>;
type FieldErrors = Partial<Record<keyof LoginFields, string>>;

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const [fields, setFields] = useState<LoginFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  function setField<K extends keyof LoginFields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateField(key: keyof LoginFields) {
    const result = loginSchema.safeParse(fields);
    if (!result.success) {
      const fieldError = result.error.flatten().fieldErrors[key]?.[0];
      setErrors((prev) => ({ ...prev, [key]: fieldError }));
    }
  }

  function validate(): boolean {
    const result = loginSchema.safeParse(fields);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
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
      const result = await authLogin({
        email: fields.email.trim(),
        password: fields.password,
      });
      setAccessToken(result.access_token);
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        if (ex.statusCode === 401) {
          setServerError("Email or password is incorrect.");
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

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Input
        id="login-email"
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

      <div className="space-y-1">
        <Input
          id="login-password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          value={fields.password}
          onChange={(e) => setField("password", e.target.value)}
          onBlur={() => validateField("password")}
          errorMessage={errors.password}
        />
        <div className="flex justify-end">
          <a
            href="/forgot-password"
            className="text-xs text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Sign in
      </Button>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-text-tertiary">Loading…</p>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
