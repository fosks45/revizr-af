/**
 * Authenticated app layout — wraps all /(app)/* routes in AppShell.
 *
 * WCAG: SkipLink is already in the root layout; AppShell provides
 * the <main id="main-content" tabIndex={-1}> target.
 *
 * Exception: /practice/session uses its own layout and renders inside AppShell
 * with focusedMode=true via the AppShellContext.
 */

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
