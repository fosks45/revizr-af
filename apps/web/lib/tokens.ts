/**
 * Revizr Design Tokens
 *
 * Every token maps 1:1 to the spec in specs/002-revizr/design-pack/design-tokens.md.
 * Components MUST reference these constants — no hex literals, no raw px values.
 * CSS custom properties are injected via injectTokenCSS() in the root layout.
 */

// ─── Primitive Colour Tokens ───────────────────────────────────────────────

export const primitiveColors = {
  // Indigo (brand primary)
  indigoColor50: "#eef2ff",
  indigoColor100: "#e0e7ff",
  indigoColor200: "#c7d2fe",
  indigoColor300: "#a5b4fc",
  indigoColor400: "#818cf8",
  indigoColor500: "#6366f1",
  indigoColor600: "#4f46e5",
  indigoColor700: "#4338ca", // 7.1:1 on white — AA + AAA
  indigoColor800: "#3730a3",
  indigoColor900: "#312e81",
  indigoColor950: "#1e1b4b",

  // Amber (accent)
  amberColor50: "#fffbeb",
  amberColor100: "#fef3c7",
  amberColor200: "#fde68a",
  amberColor300: "#fcd34d",
  amberColor400: "#fbbf24",
  amberColor500: "#f59e0b",
  amberColor600: "#d97706",
  amberColor700: "#b45309", // 4.6:1 on white — AA all text
  amberColor800: "#92400e",
  amberColor900: "#78350f",

  // Emerald (success)
  emeraldColor50: "#ecfdf5",
  emeraldColor100: "#d1fae5",
  emeraldColor200: "#a7f3d0",
  emeraldColor300: "#6ee7b7",
  emeraldColor400: "#34d399",
  emeraldColor500: "#10b981",
  emeraldColor600: "#059669",
  emeraldColor700: "#047857", // 4.8:1 on white — AA all text
  emeraldColor800: "#065f46",
  emeraldColor900: "#064e3b",

  // Neutral
  neutralColor0: "#ffffff",
  neutralColor50: "#f9fafb",
  neutralColor100: "#f3f4f6",
  neutralColor150: "#ebebeb",
  neutralColor200: "#e5e7eb",
  neutralColor300: "#d1d5db",
  neutralColor400: "#9ca3af",
  neutralColor500: "#6b7280",
  neutralColor600: "#4b5563", // 5.3:1 on white — AA
  neutralColor700: "#374151", // 7.5:1 on white — AAA
  neutralColor800: "#1f2937", // 11:1 on white
  neutralColor900: "#111827", // 16:1 on white
  neutralColor950: "#030712",

  // Red (error)
  redColor50: "#fef2f2",
  redColor100: "#fee2e2",
  redColor200: "#fecaca",
  redColor300: "#fca5a5",
  redColor600: "#dc2626", // 4.7:1 on white — AA
  redColor700: "#b91c1c", // 6.3:1 on white — AA
  redColor800: "#991b1b",

  // Orange (warning)
  orangeColor50: "#fff7ed",
  orangeColor100: "#ffedd5",
  orangeColor700: "#c2410c", // 4.6:1 on white — AA
  orangeColor800: "#9a3412", // 5.9:1

  // Sky (info)
  skyColor50: "#f0f9ff",
  skyColor100: "#e0f2fe",
  skyColor700: "#0369a1", // 4.8:1 on white — AA
} as const;

// ─── Semantic Colour Tokens ────────────────────────────────────────────────

export const semanticColors = {
  // Interactive — Brand
  interactivePrimary: primitiveColors.indigoColor700,
  interactivePrimaryHover: primitiveColors.indigoColor800,
  interactivePrimaryPressed: primitiveColors.indigoColor900,
  interactivePrimaryDisabled: primitiveColors.neutralColor300,
  interactiveSecondary: primitiveColors.indigoColor100,
  interactiveSecondaryHover: primitiveColors.indigoColor200,
  interactiveSecondaryText: primitiveColors.indigoColor700,
  interactiveGhostHover: primitiveColors.neutralColor150,

  // Interactive — Accent
  accentPrimary: primitiveColors.amberColor700,
  accentBackground: primitiveColors.amberColor50,

  // Text
  textPrimary: primitiveColors.neutralColor900,
  textSecondary: primitiveColors.neutralColor700,
  textTertiary: primitiveColors.neutralColor600,
  textPlaceholder: primitiveColors.neutralColor400,
  textDisabled: primitiveColors.neutralColor400,
  textInverse: primitiveColors.neutralColor0,
  textLink: primitiveColors.indigoColor700,
  textLinkVisited: primitiveColors.indigoColor800,
  textError: primitiveColors.redColor700,
  textSuccess: primitiveColors.emeraldColor700,
  textWarning: primitiveColors.orangeColor700,

  // Background
  bgPage: primitiveColors.neutralColor50,
  bgSurface: primitiveColors.neutralColor0,
  bgSurfaceRaised: primitiveColors.neutralColor0,
  bgSurfaceOverlay: primitiveColors.neutralColor100,
  bgBrandSubtle: primitiveColors.indigoColor50,
  bgBrandStrong: primitiveColors.indigoColor700,
  bgAccentSubtle: primitiveColors.amberColor50,
  bgSuccessSubtle: primitiveColors.emeraldColor50,
  bgErrorSubtle: primitiveColors.redColor50,
  bgWarningSubtle: primitiveColors.orangeColor50,
  bgInfoSubtle: primitiveColors.skyColor50,
  bgDisabled: primitiveColors.neutralColor100,

  // Border
  borderDefault: primitiveColors.neutralColor200,
  borderStrong: primitiveColors.neutralColor400,
  borderInteractive: primitiveColors.indigoColor700,
  borderError: primitiveColors.redColor700,
  borderSuccess: primitiveColors.emeraldColor700,
  borderDisabled: primitiveColors.neutralColor300,

  // Focus Ring
  focusRing: primitiveColors.indigoColor700,
  focusRingOffset: primitiveColors.neutralColor0,

  // Status / Topic Strength (MUST be paired with icon + text label)
  statusStrong: primitiveColors.emeraldColor700,
  statusImproving: primitiveColors.emeraldColor600,
  statusModerate: primitiveColors.amberColor700,
  statusWeak: primitiveColors.orangeColor700,
  statusCritical: primitiveColors.redColor700,
  statusNeutral: primitiveColors.neutralColor600,
} as const;

// ─── Typography Tokens ─────────────────────────────────────────────────────

export const typography = {
  fontFamilyBase:
    '"system-ui", "-apple-system", "Segoe UI", "Helvetica Neue", "Arial", sans-serif',
  fontFamilyMono:
    '"ui-monospace", "Cascadia Code", "Source Code Pro", "Menlo", "Consolas", "Liberation Mono", monospace',

  // Scale (Major Third 1.25)
  fontSize2xs: "0.64rem",
  fontSizeXs: "0.8rem",
  fontSizeSm: "1rem",
  fontSizeMd: "1.25rem",
  fontSizeLg: "1.5rem",
  fontSizeXl: "1.875rem",
  fontSize2xl: "2.25rem",
  fontSize3xl: "2.75rem",
  fontSize4xl: "3.5rem",

  // Responsive h1/h2/h3
  fontSizeH1Mobile: "1.875rem", // xl
  fontSizeH1Desktop: "2.25rem", // 2xl
  fontSizeH2Mobile: "1.5rem", // lg
  fontSizeH2Desktop: "1.875rem", // xl
  fontSizeH3Mobile: "1.25rem", // md
  fontSizeH3Desktop: "1.5rem", // lg

  // Weight
  fontWeightRegular: "400",
  fontWeightMedium: "500",
  fontWeightSemibold: "600",
  fontWeightBold: "700",

  // Line height
  lineHeightTight: "1.2",
  lineHeightSnug: "1.35",
  lineHeightNormal: "1.5",
  lineHeightRelaxed: "1.65",
  lineHeightLoose: "1.85",

  // Letter spacing
  letterSpacingTight: "-0.025em",
  letterSpacingNormal: "0",
  letterSpacingWide: "0.025em",
  letterSpacingWider: "0.05em",

  // Age-cohort aliases
  fontSizeBody11plus: "1.25rem",
  lineHeightBody11plus: "1.85",
  fontSizeBodyGcse: "1rem",
  lineHeightBodyGcse: "1.65",
  fontSizeBodyAlevel: "1rem",
  lineHeightBodyAlevel: "1.5",
  fontSizeBodyParent: "1rem",
  lineHeightBodyParent: "1.5",
} as const;

// ─── Spacing Tokens ────────────────────────────────────────────────────────

export const spacing = {
  space0: "0",
  space1: "0.25rem",
  space2: "0.5rem",
  space3: "0.75rem",
  space4: "1rem",
  space5: "1.25rem",
  space6: "1.5rem",
  space8: "2rem",
  space10: "2.5rem",
  space12: "3rem",
  space16: "4rem",
  space20: "5rem",
  space24: "6rem",

  // Semantic aliases
  componentPaddingXs: "0.5rem",
  componentPaddingSm: "0.75rem",
  componentPaddingMd: "1rem",
  componentPaddingLg: "1.5rem",
  layoutSection: "3rem",
  layoutPageHorizontal: "1rem",
  layoutPageHorizontalLg: "2rem",
  layoutPageHorizontalXl: "4rem",
  stackSm: "0.5rem",
  stackMd: "1rem",
  stackLg: "2rem",
} as const;

// ─── Border Radius Tokens ──────────────────────────────────────────────────

export const borderRadius = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",

  // Semantic
  button: "0.5rem",
  input: "0.5rem",
  card: "0.75rem",
  modal: "1rem",
  chip: "0.25rem",
  badge: "9999px",
  avatar: "9999px",
} as const;

// ─── Shadow Tokens ─────────────────────────────────────────────────────────

export const shadows = {
  none: "none",
  xs: "0 1px 2px 0 rgba(0,0,0,0.04)",
  sm: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
  md: "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05)",
  inset: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",

  // Semantic
  card: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
  cardHover:
    "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
  dropdown:
    "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
  modal: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)",
  toast: "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
  stickyHeader:
    "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
} as const;

// ─── Motion Tokens ─────────────────────────────────────────────────────────

export const motion = {
  durationInstant: "0ms",
  durationFast: "100ms",
  durationNormal: "200ms",
  durationSlow: "350ms",
  durationDeliberate: "500ms",
  durationLoading: "800ms",

  easingLinear: "linear",
  easingStandard: "cubic-bezier(0.4, 0, 0.2, 1)",
  easingDecelerate: "cubic-bezier(0, 0, 0.2, 1)",
  easingAccelerate: "cubic-bezier(0.4, 0, 1, 1)",
  easingSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

// ─── Breakpoint Tokens ─────────────────────────────────────────────────────

export const breakpoints = {
  xs: "320px",
  sm: "480px",
  md: "768px",
  lg: "1024px",
  xl: "1440px",
  "2xl": "1920px",
} as const;

// ─── Touch Target Tokens ───────────────────────────────────────────────────

export const touchTargets = {
  min: "44px",
  default: "48px",
  large: "56px",
} as const;

// ─── Z-Index Tokens ────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const;

// ─── CSS Custom Property Injection ─────────────────────────────────────────

/**
 * Returns a string of CSS custom properties to be injected into the :root
 * selector of the global stylesheet. Call once in the root layout.
 */
export function buildTokenCSS(): string {
  const entries: string[] = [
    // Semantic colors
    `--color-interactive-primary: ${semanticColors.interactivePrimary}`,
    `--color-interactive-primary-hover: ${semanticColors.interactivePrimaryHover}`,
    `--color-interactive-primary-pressed: ${semanticColors.interactivePrimaryPressed}`,
    `--color-interactive-primary-disabled: ${semanticColors.interactivePrimaryDisabled}`,
    `--color-interactive-secondary: ${semanticColors.interactiveSecondary}`,
    `--color-interactive-secondary-hover: ${semanticColors.interactiveSecondaryHover}`,
    `--color-interactive-secondary-text: ${semanticColors.interactiveSecondaryText}`,
    `--color-interactive-ghost-hover: ${semanticColors.interactiveGhostHover}`,
    `--color-accent-primary: ${semanticColors.accentPrimary}`,
    `--color-accent-background: ${semanticColors.accentBackground}`,
    `--color-text-primary: ${semanticColors.textPrimary}`,
    `--color-text-secondary: ${semanticColors.textSecondary}`,
    `--color-text-tertiary: ${semanticColors.textTertiary}`,
    `--color-text-placeholder: ${semanticColors.textPlaceholder}`,
    `--color-text-disabled: ${semanticColors.textDisabled}`,
    `--color-text-inverse: ${semanticColors.textInverse}`,
    `--color-text-link: ${semanticColors.textLink}`,
    `--color-text-link-visited: ${semanticColors.textLinkVisited}`,
    `--color-text-error: ${semanticColors.textError}`,
    `--color-text-success: ${semanticColors.textSuccess}`,
    `--color-text-warning: ${semanticColors.textWarning}`,
    `--color-bg-page: ${semanticColors.bgPage}`,
    `--color-bg-surface: ${semanticColors.bgSurface}`,
    `--color-bg-surface-raised: ${semanticColors.bgSurfaceRaised}`,
    `--color-bg-surface-overlay: ${semanticColors.bgSurfaceOverlay}`,
    `--color-bg-brand-subtle: ${semanticColors.bgBrandSubtle}`,
    `--color-bg-brand-strong: ${semanticColors.bgBrandStrong}`,
    `--color-bg-accent-subtle: ${semanticColors.bgAccentSubtle}`,
    `--color-bg-success-subtle: ${semanticColors.bgSuccessSubtle}`,
    `--color-bg-error-subtle: ${semanticColors.bgErrorSubtle}`,
    `--color-bg-warning-subtle: ${semanticColors.bgWarningSubtle}`,
    `--color-bg-info-subtle: ${semanticColors.bgInfoSubtle}`,
    `--color-bg-disabled: ${semanticColors.bgDisabled}`,
    `--color-border-default: ${semanticColors.borderDefault}`,
    `--color-border-strong: ${semanticColors.borderStrong}`,
    `--color-border-interactive: ${semanticColors.borderInteractive}`,
    `--color-border-error: ${semanticColors.borderError}`,
    `--color-border-success: ${semanticColors.borderSuccess}`,
    `--color-border-disabled: ${semanticColors.borderDisabled}`,
    `--color-focus-ring: ${semanticColors.focusRing}`,
    `--color-focus-ring-offset: ${semanticColors.focusRingOffset}`,
    `--color-status-strong: ${semanticColors.statusStrong}`,
    `--color-status-improving: ${semanticColors.statusImproving}`,
    `--color-status-moderate: ${semanticColors.statusModerate}`,
    `--color-status-weak: ${semanticColors.statusWeak}`,
    `--color-status-critical: ${semanticColors.statusCritical}`,
    `--color-status-neutral: ${semanticColors.statusNeutral}`,
    // Typography
    `--font-family-base: ${typography.fontFamilyBase}`,
    `--font-family-mono: ${typography.fontFamilyMono}`,
    // Motion
    `--duration-fast: ${motion.durationFast}`,
    `--duration-normal: ${motion.durationNormal}`,
    `--duration-slow: ${motion.durationSlow}`,
    `--duration-deliberate: ${motion.durationDeliberate}`,
    `--easing-standard: ${motion.easingStandard}`,
    `--easing-decelerate: ${motion.easingDecelerate}`,
    `--easing-accelerate: ${motion.easingAccelerate}`,
    `--easing-spring: ${motion.easingSpring}`,
  ];

  return `:root {\n  ${entries.join(";\n  ")};\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :root {\n    --duration-fast: 0ms;\n    --duration-normal: 0ms;\n    --duration-slow: 0ms;\n    --duration-deliberate: 0ms;\n    --easing-spring: linear;\n  }\n}`;
}
