/**
 * Tailwind CSS configuration — maps every design token to a Tailwind utility.
 * Zero hex literals in this file. All values sourced from lib/tokens.ts.
 *
 * Components use semantic class names like:
 *   text-primary, bg-surface, border-subtle, text-error, bg-brand-strong
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Semantic Text Colors ───────────────────────────────────────
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        "text-placeholder": "var(--color-text-placeholder)",
        "text-disabled": "var(--color-text-disabled)",
        "text-inverse": "var(--color-text-inverse)",
        "text-link": "var(--color-text-link)",
        "text-link-visited": "var(--color-text-link-visited)",
        "text-error": "var(--color-text-error)",
        "text-success": "var(--color-text-success)",
        "text-warning": "var(--color-text-warning)",
        "accent-primary": "var(--color-accent-primary)",

        // ── Background Colors ──────────────────────────────────────────
        "bg-page": "var(--color-bg-page)",
        "bg-surface": "var(--color-bg-surface)",
        "bg-surface-raised": "var(--color-bg-surface-raised)",
        "bg-surface-overlay": "var(--color-bg-surface-overlay)",
        "bg-brand-subtle": "var(--color-bg-brand-subtle)",
        "bg-brand-strong": "var(--color-bg-brand-strong)",
        "bg-accent-subtle": "var(--color-bg-accent-subtle)",
        "bg-success-subtle": "var(--color-bg-success-subtle)",
        "bg-error-subtle": "var(--color-bg-error-subtle)",
        "bg-warning-subtle": "var(--color-bg-warning-subtle)",
        "bg-info-subtle": "var(--color-bg-info-subtle)",
        "bg-disabled": "var(--color-bg-disabled)",

        // ── Interactive Colors ─────────────────────────────────────────
        "interactive-primary": "var(--color-interactive-primary)",
        "interactive-primary-hover": "var(--color-interactive-primary-hover)",
        "interactive-primary-pressed": "var(--color-interactive-primary-pressed)",
        "interactive-primary-disabled": "var(--color-interactive-primary-disabled)",
        "interactive-secondary": "var(--color-interactive-secondary)",
        "interactive-secondary-hover": "var(--color-interactive-secondary-hover)",
        "interactive-secondary-text": "var(--color-interactive-secondary-text)",
        "interactive-ghost-hover": "var(--color-interactive-ghost-hover)",

        // ── Border Colors ──────────────────────────────────────────────
        "border-default": "var(--color-border-default)",
        "border-strong": "var(--color-border-strong)",
        "border-interactive": "var(--color-border-interactive)",
        "border-error": "var(--color-border-error)",
        "border-success": "var(--color-border-success)",
        "border-disabled": "var(--color-border-disabled)",

        // ── Focus Ring ─────────────────────────────────────────────────
        "focus-ring": "var(--color-focus-ring)",
        "focus-ring-offset": "var(--color-focus-ring-offset)",

        // ── Status / Topic Strength ───────────────────────────────────
        "status-strong": "var(--color-status-strong)",
        "status-improving": "var(--color-status-improving)",
        "status-moderate": "var(--color-status-moderate)",
        "status-weak": "var(--color-status-weak)",
        "status-critical": "var(--color-status-critical)",
        "status-neutral": "var(--color-status-neutral)",
      },

      fontFamily: {
        base: "var(--font-family-base)",
        mono: "var(--font-family-mono)",
      },

      fontSize: {
        "2xs": ["0.64rem", { lineHeight: "1.2" }],
        xs: ["0.8rem", { lineHeight: "1.35" }],
        sm: ["1rem", { lineHeight: "1.5" }],
        md: ["1.25rem", { lineHeight: "1.65" }],
        lg: ["1.5rem", { lineHeight: "1.35" }],
        xl: ["1.875rem", { lineHeight: "1.2" }],
        "2xl": ["2.25rem", { lineHeight: "1.2" }],
        "3xl": ["2.75rem", { lineHeight: "1.2" }],
        "4xl": ["3.5rem", { lineHeight: "1.2" }],
      },

      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      lineHeight: {
        tight: "1.2",
        snug: "1.35",
        normal: "1.5",
        relaxed: "1.65",
        loose: "1.85",
      },

      letterSpacing: {
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
      },

      spacing: {
        // Primitive scale
        "0": "0",
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "8": "2rem",
        "10": "2.5rem",
        "12": "3rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem",
        // Touch targets (non-standard values)
        "touch-min": "44px",
        "touch-default": "48px",
        "touch-large": "56px",
      },

      borderRadius: {
        none: "0",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },

      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.04)",
        sm: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        md: "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
        lg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)",
        xl: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05)",
        inset: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
        card: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-hover":
          "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
        modal:
          "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)",
        "focus-ring": `0 0 0 2px var(--color-focus-ring-offset), 0 0 0 4px var(--color-focus-ring)`,
      },

      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        deliberate: "var(--duration-deliberate)",
      },

      transitionTimingFunction: {
        standard: "var(--easing-standard)",
        decelerate: "var(--easing-decelerate)",
        accelerate: "var(--easing-accelerate)",
        spring: "var(--easing-spring)",
      },

      screens: {
        xs: "320px",
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1440px",
        "2xl": "1920px",
      },

      zIndex: {
        base: "0",
        raised: "10",
        dropdown: "100",
        sticky: "200",
        overlay: "300",
        modal: "400",
        toast: "500",
        tooltip: "600",
      },
    },
  },
  plugins: [],
};

export default config;
