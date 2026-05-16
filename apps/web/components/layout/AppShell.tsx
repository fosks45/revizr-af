/**
 * AppShell — authenticated app shell with nav + main landmark.
 *
 * WCAG compliance:
 * - S4: landmark elements <header>, <nav>, <main>, <footer>
 * - Route change announcements via #route-announcer (live region in root layout)
 * - Skip link target: <main id="main-content" tabIndex={-1}>
 */

"use client";

import type { ReactNode } from "react";
import { Nav } from "./Nav";

interface AppShellProps {
  children: ReactNode;
  /** Hide nav during active practice session (focused mode) */
  focusedMode?: boolean;
}

export function AppShell({ children, focusedMode = false }: AppShellProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg-page">
      {!focusedMode && (
        <header className="sticky top-0 z-sticky bg-bg-brand-strong shadow-sticky-header">
          {/* Desktop top bar — visible at lg+ */}
          <div className="hidden lg:flex items-center justify-between h-16 page-container">
            <a
              href="/dashboard"
              className="text-text-inverse font-bold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1"
            >
              Revizr
            </a>
            <Nav orientation="horizontal" />
          </div>

          {/* Mobile top bar — shown below lg */}
          <div className="flex lg:hidden items-center justify-between h-14 px-4">
            <a
              href="/dashboard"
              className="text-text-inverse font-bold text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1"
            >
              Revizr
            </a>
          </div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav — desktop only */}
        {!focusedMode && (
          <aside className="hidden lg:flex flex-col w-56 bg-bg-surface border-r border-border-default shrink-0">
            <nav aria-label="Main navigation">
              <Nav orientation="vertical" />
            </nav>
          </aside>
        )}

        {/* Main content area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto focus-visible:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {!focusedMode && (
        <nav
          aria-label="Main navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-sticky bg-bg-surface border-t border-border-default"
        >
          <Nav orientation="bottom-tabs" />
        </nav>
      )}
    </div>
  );
}
