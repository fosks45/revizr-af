/**
 * Privacy & data page — GDPR rights.
 *
 * Two-step deletion confirmation with explicit warning.
 * Download data triggers GET /users/me/export.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import {
  getUsersMeExport,
  deleteUsersMe,
  RevizrApiError,
} from "@/lib/api";

export default function PrivacyPage() {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | undefined>();
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "deleting">(
    "idle"
  );
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | undefined>();

  async function handleDownload() {
    setIsDownloading(true);
    setDownloadError(undefined);
    try {
      const data = await getUsersMeExport();
      // Create a downloadable JSON blob
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "revizr-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        setDownloadError(ex.apiError.message);
      } else {
        setDownloadError("Unable to download data. Please try again.");
      }
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (deleteConfirmInput !== "DELETE") return;
    setDeleteStep("deleting");
    setDeleteError(undefined);
    try {
      await deleteUsersMe();
      router.push("/login?deleted=1");
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        setDeleteError(ex.apiError.message);
      } else {
        setDeleteError("Unable to delete account. Please contact support.");
      }
      setDeleteStep("confirm");
    }
  }

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="text-xl font-bold text-text-primary mb-2">
        Privacy &amp; data
      </h1>
      <p className="text-sm text-text-secondary mb-8">
        Your data rights under UK GDPR. You can download a copy of your data or
        delete your account at any time.
      </p>

      <div className="space-y-6">
        {/* Data retention info */}
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            What we store
          </h2>
          <ul className="space-y-2 text-sm text-text-secondary list-disc list-inside">
            <li>Your email address and display name</li>
            <li>Subjects, exam boards, and revision levels you&rsquo;ve set</li>
            <li>Practice session records (questions, self-marks, time)</li>
            <li>Diagnostic results and topic weakness scores</li>
            <li>Session start/end timestamps</li>
          </ul>
          <p className="text-xs text-text-tertiary mt-4">
            We never sell your data. Data is retained for the duration of your
            account plus 7 years (legal obligation), unless you request
            deletion.
          </p>
        </Card>

        {/* Download */}
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-2">
            Download my data
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            Receive a JSON export of all data associated with your account.
          </p>
          {downloadError && (
            <Alert variant="error" className="mb-3">
              {downloadError}
            </Alert>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            isLoading={isDownloading}
            disabled={isDownloading}
            className="w-auto"
          >
            Download my data
          </Button>
        </Card>

        {/* Delete account */}
        <Card>
          <h2 className="text-sm font-semibold text-text-error mb-2">
            Delete my account
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Deleting your account will cancel your subscription and permanently
            remove all your data. This cannot be undone.
          </p>

          {deleteStep === "idle" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteStep("confirm")}
              className="w-auto"
            >
              Delete my account
            </Button>
          )}

          {(deleteStep === "confirm" || deleteStep === "deleting") && (
            <div className="space-y-4">
              <Alert variant="error">
                <p className="font-semibold">This is permanent and irreversible.</p>
                <p className="mt-1 text-sm">
                  All your data — including practice history, diagnostic results,
                  and subject settings — will be permanently deleted.
                </p>
              </Alert>

              {deleteError && (
                <Alert variant="error">{deleteError}</Alert>
              )}

              <Input
                id="delete-confirm"
                type="text"
                label={`Type DELETE to confirm`}
                autoComplete="off"
                value={deleteConfirmInput}
                onChange={(e) =>
                  setDeleteConfirmInput(e.target.value.toUpperCase())
                }
                errorMessage={
                  deleteConfirmInput && deleteConfirmInput !== "DELETE"
                    ? 'Please type DELETE exactly.'
                    : undefined
                }
              />

              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteConfirm}
                  disabled={
                    deleteConfirmInput !== "DELETE" || deleteStep === "deleting"
                  }
                  isLoading={deleteStep === "deleting"}
                  className="w-auto"
                >
                  Permanently delete my account
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDeleteStep("idle");
                    setDeleteConfirmInput("");
                    setDeleteError(undefined);
                  }}
                  className="w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
