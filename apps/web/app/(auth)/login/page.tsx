/**
 * Login page.
 */

import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Sign in to Revizr
        </h1>
        <p className="text-sm text-text-secondary">
          Welcome back. Enter your email and password below.
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-sm text-center text-text-secondary">
        Don&rsquo;t have an account?{" "}
        <a
          href="/register"
          className="text-text-link font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
        >
          Create a parent account
        </a>
      </p>
    </>
  );
}
