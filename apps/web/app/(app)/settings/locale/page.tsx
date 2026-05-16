/**
 * Language settings — English / Welsh (Cymraeg) toggle.
 *
 * On change:
 * 1. PATCH /settings/locale
 * 2. Update <html lang> attribute client-side
 * 3. Swap i18n context (via cookie/localStorage read by the root layout)
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  getLocaleSettings,
  updateLocaleSettings,
  type LocaleSettings,
  RevizrApiError,
} from "@/lib/api";

type Locale = "en-GB" | "cy";

const LOCALE_OPTIONS: { value: Locale; label: string; nativeLabel: string }[] =
  [
    { value: "en-GB", label: "English", nativeLabel: "English" },
    { value: "cy", label: "Welsh", nativeLabel: "Cymraeg" },
  ];

export default function LocaleSettingsPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en-GB");
  const [pending, setPending] = useState<Locale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      try {
        const settings = await getLocaleSettings();
        setLocale(settings.locale);
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        }
        // Non-fatal — default to en-GB
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [router]);

  async function handleSave() {
    const target = pending ?? locale;
    setIsSaving(true);
    setSaved(false);
    setError(undefined);
    try {
      await updateLocaleSettings(target);
      setLocale(target);
      setPending(null);
      setSaved(true);

      // Update <html lang> attribute immediately
      document.documentElement.lang = target;

      // Store locale preference for SSR hydration
      document.cookie = `revizr_locale=${target}; path=/; max-age=31536000; samesite=strict`;
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        setError(ex.apiError.message);
      } else {
        setError("Unable to save. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <p className="text-text-tertiary text-sm" aria-live="polite">
          Loading language settings…
        </p>
      </div>
    );
  }

  const activeLocale = pending ?? locale;
  const hasChange = pending !== null && pending !== locale;

  return (
    <div className="page-container py-8 max-w-xl">
      <h1 className="text-xl font-bold text-text-primary mb-2">
        Language / Iaith
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        Choose the language for the Revizr interface.
        {" "}
        <span lang="cy">Dewiswch iaith rhyngwyneb Revizr.</span>
      </p>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      {saved && (
        <Alert variant="success" className="mb-4">
          Language updated.{" "}
          {locale === "cy" && <span lang="cy">Iaith wedi&rsquo;i diweddaru.</span>}
        </Alert>
      )}

      <Card>
        <fieldset className="border-0 m-0 p-0">
          <legend className="text-sm font-semibold text-text-primary mb-4">
            Select language
          </legend>

          <div className="space-y-3">
            {LOCALE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                htmlFor={`locale-${opt.value}`}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border cursor-pointer
                  transition-colors duration-fast
                  focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-offset-2
                  ${
                    activeLocale === opt.value
                      ? "border-border-interactive bg-bg-brand-subtle"
                      : "border-border-default bg-bg-surface hover:border-border-strong"
                  }
                `}
              >
                <input
                  id={`locale-${opt.value}`}
                  type="radio"
                  name="locale"
                  value={opt.value}
                  checked={activeLocale === opt.value}
                  onChange={() => setPending(opt.value)}
                  className="
                    w-5 h-5 border-2 border-border-default rounded-full
                    checked:border-interactive-primary checked:bg-interactive-primary
                    focus-visible:outline-none
                    transition-colors duration-fast
                    accent-interactive-primary
                  "
                  lang={opt.value}
                />
                <div className="flex-1">
                  <p
                    className="text-sm font-semibold text-text-primary"
                    lang={opt.value}
                  >
                    {opt.nativeLabel}
                  </p>
                  {opt.value === "cy" && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      Welsh
                    </p>
                  )}
                </div>
                {activeLocale === opt.value && (
                  <span
                    aria-hidden="true"
                    className="text-interactive-primary text-sm font-bold"
                  >
                    ✓
                  </span>
                )}
              </label>
            ))}
          </div>
        </fieldset>

        {hasChange && (
          <div className="mt-6">
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={isSaving}
              className="max-w-xs"
            >
              Save language preference
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
