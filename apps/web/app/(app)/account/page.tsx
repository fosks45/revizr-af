/**
 * Account settings — display name, email change, password change.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  getUsersMe,
  patchUsersMe,
  type UserProfile,
  RevizrApiError,
} from "@/lib/api";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string | undefined>();
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profile = await getUsersMe();
        setUser(profile);
        setDisplayName(profile.display_name);
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [router]);

  async function handleSaveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameError(undefined);
    if (!displayName.trim()) {
      setDisplayNameError("Display name is required.");
      return;
    }
    setDisplayNameError(undefined);
    setIsSavingName(true);
    try {
      const updated = await patchUsersMe({ display_name: displayName.trim() });
      setUser(updated);
      setNameSaved(true);
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        setNameError(ex.apiError.message);
      } else {
        setNameError("Unable to save. Please try again.");
      }
    } finally {
      setIsSavingName(false);
    }
  }

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <p className="text-text-tertiary text-sm" aria-live="polite">
          Loading account…
        </p>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="text-xl font-bold text-text-primary mb-6">
        Account settings
      </h1>

      <div className="space-y-6">
        {/* Display name */}
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-4">
            Display name
          </h2>
          {nameSaved && (
            <Alert variant="success" className="mb-4">
              Display name updated.
            </Alert>
          )}
          {nameError && (
            <Alert variant="error" className="mb-4">
              {nameError}
            </Alert>
          )}
          <form onSubmit={handleSaveName} noValidate className="space-y-4">
            <Input
              id="display-name"
              type="text"
              label="Display name"
              autoComplete="name"
              required
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setNameSaved(false);
                if (displayNameError && e.target.value.trim())
                  setDisplayNameError(undefined);
              }}
              onBlur={() => {
                if (!displayName.trim())
                  setDisplayNameError("Display name is required.");
              }}
              errorMessage={displayNameError}
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isSavingName}
              disabled={isSavingName}
              className="w-auto"
            >
              Save name
            </Button>
          </form>
        </Card>

        {/* Email */}
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-2">
            Email address
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Your current email is{" "}
            <strong className="text-text-primary">{user?.email}</strong>.
          </p>
          <p className="text-xs text-text-tertiary">
            To change your email address, please{" "}
            <a
              href="mailto:support@revizr.co.uk"
              className="text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
            >
              contact support
            </a>
            .
          </p>
        </Card>

        {/* Password */}
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-2">
            Password
          </h2>
          <p className="text-xs text-text-tertiary mb-4">
            To change your password, use the "Forgot password" flow.
          </p>
          <a
            href="/forgot-password"
            className="
              inline-flex items-center justify-center
              h-touch-min px-4 text-sm font-semibold rounded-md
              bg-interactive-secondary text-interactive-secondary-text
              border border-border-default
              hover:bg-interactive-secondary-hover
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
              focus-visible:ring-offset-2
              transition-colors duration-fast
            "
          >
            Reset password by email
          </a>
        </Card>

        {/* Quick links */}
        <nav aria-label="Account sections">
          <ul className="space-y-2">
            {[
              { href: "/account/subscription", label: "Subscription" },
              { href: "/account/privacy", label: "Privacy & data" },
              { href: "/settings/locale", label: "Language settings" },
            ].map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="
                    block px-4 py-3 text-sm text-text-primary
                    bg-bg-surface border border-border-default rounded-lg
                    hover:border-border-interactive hover:text-interactive-primary
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                    focus-visible:ring-offset-2
                    transition-colors duration-fast
                  "
                >
                  {label} →
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
