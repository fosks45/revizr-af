/**
 * Root layout — sets lang attribute, injects design token CSS custom properties,
 * and wraps the app in PWA-compatible metadata.
 *
 * lang attribute is "en-GB" by default; individual page components update the
 * HTML lang attribute client-side when Welsh is active (via a client boundary).
 * WCAG 3.1.1 satisfied via the default; WCAG 3.1.2 satisfied by dynamic update.
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { buildTokenCSS } from "@/lib/tokens";
import { SkipLink } from "@/components/ui/SkipLink";

export const metadata: Metadata = {
  title: {
    default: "Revizr — Personalised Exam Revision",
    template: "%s | Revizr",
  },
  description:
    "Real past paper questions targeted at your weak spots. Free to try.",
  applicationName: "Revizr",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Revizr",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Revizr",
    title: "Revizr — Personalised Exam Revision",
    description: "Real past paper questions targeted at your weak spots.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  themeColor: "#4338ca", // color-interactive-primary
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const tokenCSS = buildTokenCSS();

  return (
    <html lang="en-GB" dir="ltr">
      <head>
        {/* Inject design token CSS custom properties */}
        <style dangerouslySetInnerHTML={{ __html: tokenCSS }} />
      </head>
      <body>
        {/* WCAG 2.4.1 — Skip link must be the first focusable element */}
        <SkipLink href="#main-content" />

        {/* Route change announcer — WCAG 4.1.3, RX2 */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="route-announcer"
        />

        {children}
      </body>
    </html>
  );
}
