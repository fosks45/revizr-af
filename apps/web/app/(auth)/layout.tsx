/**
 * Auth layout — centred card container.
 * No navigation chrome. Full-height page with brand header.
 *
 * WCAG: landmark elements present (<header>, <main>). No nav required here.
 */

import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg-page">
      <header className="py-6 flex justify-center">
        <a
          href="/"
          className="
            text-xl font-bold text-interactive-primary
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-focus-ring focus-visible:ring-offset-2
          "
        >
          Revizr
        </a>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex items-start justify-center px-4 py-8 focus-visible:outline-none"
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-text-tertiary px-4">
        <p>
          &copy; {new Date().getFullYear()} Revizr Ltd.{" "}
          <a
            href="/privacy"
            className="text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          >
            Privacy Policy
          </a>{" "}
          &middot;{" "}
          <a
            href="/terms"
            className="text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          >
            Terms of Service
          </a>
        </p>
      </footer>
    </div>
  );
}
