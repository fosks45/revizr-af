/**
 * Parent registration page.
 *
 * Parent-only by design (spec sign-off decision). No role selector.
 * Student accounts are created by parents in the /setup onboarding step.
 *
 * WCAG: F1 labelled inputs, F2 aria-describedby errors, submit disabled until valid.
 */

import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your parent account",
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Create your parent account
        </h1>
        <p className="text-sm text-text-secondary">
          You&rsquo;ll add your child&rsquo;s account in the next step.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-sm text-center text-text-secondary">
        Already have an account?{" "}
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
