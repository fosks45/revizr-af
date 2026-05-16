/**
 * SkipLink — WCAG 2.4.1 Bypass Blocks (Level A)
 *
 * Must be the first focusable element on every page. Visually hidden until
 * focused. When activated, moves focus to the main content landmark.
 *
 * Usage: <SkipLink href="#main-content" />
 * Target: <main id="main-content" tabIndex={-1}>…</main>
 */

interface SkipLinkProps {
  href: string;
  label?: string;
}

export function SkipLink({ href, label = "Skip to main content" }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="
        absolute top-0 left-0 z-tooltip
        translate-y-[-100%] focus:translate-y-0
        px-4 py-2
        bg-bg-brand-strong text-text-inverse
        text-sm font-semibold
        rounded-br-md
        transition-transform duration-fast easing-standard
        focus-visible:outline-2 focus-visible:outline-focus-ring
      "
    >
      {label}
    </a>
  );
}
