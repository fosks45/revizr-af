/**
 * useI18n — returns the current locale and a t(key) translation function.
 *
 * Locale is determined from:
 * 1. The revizr_locale cookie (set when user changes language)
 * 2. The <html lang> attribute
 * 3. Falls back to "en-GB"
 *
 * The t() function looks up the current locale's strings from i18n.ts,
 * with automatic fallback to en-GB for missing Welsh strings.
 */

"use client";

import { useEffect, useState } from "react";
import { type Locale, type Strings, createT } from "@/lib/i18n";

function detectLocale(): Locale {
  if (typeof document === "undefined") return "en-GB";

  // Check cookie first
  const cookieMatch = document.cookie
    .split("; ")
    .find((row) => row.startsWith("revizr_locale="));

  if (cookieMatch) {
    const value = cookieMatch.split("=")[1] as Locale;
    if (value === "cy" || value === "en-GB") return value;
  }

  // Fall back to <html lang>
  const htmlLang = document.documentElement.lang;
  if (htmlLang === "cy") return "cy";

  return "en-GB";
}

interface I18nContext {
  locale: Locale;
  t: (key: keyof Strings) => string;
  setLocale: (locale: Locale) => void;
}

export function useI18n(): I18nContext {
  const [locale, setLocaleState] = useState<Locale>("en-GB");

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const t = createT(locale);

  function setLocale(newLocale: Locale) {
    setLocaleState(newLocale);
    // Update <html lang> attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  }

  return { locale, t, setLocale };
}
