/**
 * Parental controls page — question cap, session duration, notification preferences.
 */

"use client";

import type { Metadata } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  listChildren,
  updateParentalControls,
  getNotificationPreferences,
  updateNotificationPreferences,
  type ChildSummary,
  type NotificationPreferences,
  RevizrApiError,
} from "@/lib/api";

const QUESTION_CAP_MIN = 0;
const QUESTION_CAP_MAX = 200;
const QUESTION_CAP_DEFAULT = 50;
const SESSION_MIN_MINS = 15;
const SESSION_MAX_MINS = 180;
const SESSION_STEP_MINS = 15;
const SESSION_DEFAULT_MINS = 60;

export default function ParentalControlsPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [questionCap, setQuestionCap] = useState(QUESTION_CAP_DEFAULT);
  const [sessionDuration, setSessionDuration] = useState(SESSION_DEFAULT_MINS);
  const [notifications, setNotifications] =
    useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      try {
        const [{ children: childList }, notifPrefs] = await Promise.all([
          listChildren(),
          getNotificationPreferences(),
        ]);
        setChildren(childList);
        if (childList.length > 0) setSelectedChildId(childList[0].student_id);
        setNotifications(notifPrefs);
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        } else {
          setError("Unable to load controls. Please refresh.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [router]);

  async function handleSave() {
    if (!selectedChildId) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setError(undefined);
    try {
      await updateParentalControls(selectedChildId, {
        daily_question_cap: questionCap,
        session_duration_minutes: sessionDuration,
      });
      if (notifications) {
        await updateNotificationPreferences(notifications);
      }
      setSaveSuccess(true);
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
          Loading controls…
        </p>
      </div>
    );
  }

  const selectedChild = children.find((c) => c.student_id === selectedChildId);

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="text-xl font-bold text-text-primary mb-6">
        Parental controls
      </h1>

      {children.length > 1 && (
        <div className="mb-6">
          <label
            htmlFor="child-select"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Select child
          </label>
          <select
            id="child-select"
            value={selectedChildId ?? ""}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="input-base w-full max-w-xs"
          >
            {children.map((c) => (
              <option key={c.student_id} value={c.student_id}>
                {c.display_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedChild && (
        <p className="text-sm text-text-secondary mb-6">
          Configuring limits for{" "}
          <strong>{selectedChild.display_name}</strong>.
        </p>
      )}

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      {saveSuccess && (
        <Alert variant="success" className="mb-4">
          Controls saved.
        </Alert>
      )}

      <div className="space-y-6">
        {/* Daily question cap */}
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-1">
            Daily question cap
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            Limit the number of questions per day (0 = no limit).
          </p>
          <div className="flex items-center gap-4">
            <input
              id="question-cap"
              type="range"
              min={QUESTION_CAP_MIN}
              max={QUESTION_CAP_MAX}
              step={10}
              value={questionCap}
              onChange={(e) => setQuestionCap(Number(e.target.value))}
              aria-label={`Daily question cap: ${questionCap} questions`}
              aria-valuemin={QUESTION_CAP_MIN}
              aria-valuemax={QUESTION_CAP_MAX}
              aria-valuenow={questionCap}
              className="flex-1 accent-interactive-primary"
            />
            <output
              htmlFor="question-cap"
              className="w-16 text-sm font-semibold text-text-primary text-right shrink-0"
            >
              {questionCap === 0 ? "No limit" : `${questionCap} / day`}
            </output>
          </div>
        </Card>

        {/* Session duration */}
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-1">
            Session duration limit
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            Maximum session length before a break is suggested.
          </p>
          <div className="flex items-center gap-4">
            <input
              id="session-duration"
              type="range"
              min={SESSION_MIN_MINS}
              max={SESSION_MAX_MINS}
              step={SESSION_STEP_MINS}
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              aria-label={`Session duration: ${sessionDuration} minutes`}
              aria-valuemin={SESSION_MIN_MINS}
              aria-valuemax={SESSION_MAX_MINS}
              aria-valuenow={sessionDuration}
              className="flex-1 accent-interactive-primary"
            />
            <output
              htmlFor="session-duration"
              className="w-20 text-sm font-semibold text-text-primary text-right shrink-0"
            >
              {sessionDuration} min
            </output>
          </div>
        </Card>

        {/* Notification preferences */}
        {notifications && (
          <Card>
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              Notification preferences
            </h2>
            <fieldset className="space-y-3 border-0 m-0 p-0">
              <legend className="sr-only">Notification preferences</legend>

              <ToggleRow
                id="notif-session-reminder"
                label="Session reminders"
                description="Remind your child to practise each day"
                checked={notifications.email_session_reminders}
                onChange={(v) =>
                  setNotifications({
                    ...notifications,
                    email_session_reminders: v,
                  })
                }
              />
              <ToggleRow
                id="notif-progress-reports"
                label="Weekly progress reports"
                description="Email you a summary of your child's progress"
                checked={notifications.email_progress_reports}
                onChange={(v) =>
                  setNotifications({
                    ...notifications,
                    email_progress_reports: v,
                  })
                }
              />
            </fieldset>
          </Card>
        )}

        <Button
          onClick={handleSave}
          isLoading={isSaving}
          disabled={isSaving || !selectedChildId}
          className="max-w-xs"
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <label
          htmlFor={id}
          className="text-sm font-medium text-text-primary cursor-pointer"
        >
          {label}
        </label>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
      <div className="shrink-0 flex items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="
            w-10 h-6 cursor-pointer rounded-full appearance-none border border-border-default
            bg-bg-surface-overlay checked:bg-interactive-primary
            relative transition-colors duration-fast
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
            focus-visible:ring-offset-2
          "
        />
      </div>
    </div>
  );
}
