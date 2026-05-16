/**
 * ReportUpload — drag-drop file upload zone.
 *
 * Accepts: PDF, JPEG, PNG. Max 10 MB.
 * Flow:
 * 1. File selected → display name + size
 * 2. Submit → POST /diagnostic/upload → { jobId, uploadUrl }
 * 3. PUT file to S3 presigned URL
 * 4. Open SSE to /diagnostic/events/:jobId
 * 5. Progress bar driven by SSE events
 * 6. Complete → redirect to /diagnostic/results/:sessionId
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { initiateReportUpload, connectJobSSE, RevizrApiError } from "@/lib/api";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

type UploadPhase =
  | "idle"
  | "selected"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

type SSEStatus =
  | "pending"
  | "processing"
  | "analysing"
  | "complete"
  | "failed";

const SSE_STATUS_LABELS: Record<SSEStatus, string> = {
  pending: "Uploading…",
  processing: "Reading your report…",
  analysing: "Analysing topics…",
  complete: "Done!",
  failed: "Failed",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReportUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [sseStatus, setSseStatus] = useState<SSEStatus>("pending");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const [isDragOver, setIsDragOver] = useState(false);

  function validateFile(f: File): string | undefined {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return "File must be PDF, JPEG, or PNG.";
    }
    if (f.size > MAX_BYTES) {
      return `File must be 10 MB or smaller. This file is ${formatSize(f.size)}.`;
    }
    return undefined;
  }

  function handleFileSelect(f: File) {
    const err = validateFile(f);
    setFileError(err);
    if (!err) {
      setFile(f);
      setPhase("selected");
    }
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFileSelect(f);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  async function handleSubmit() {
    if (!file) return;
    setPhase("uploading");
    setError(undefined);
    setProgress(5);

    try {
      const contentType = file.type as
        | "application/pdf"
        | "image/jpeg"
        | "image/png";

      // Step 1: Initiate upload — get presigned URL and jobId
      const { job_id, upload_url, session_id } = await initiateReportUpload({
        subject_id: "unknown", // In production, user selects subject first
        file_name: file.name,
        content_type: contentType,
      });

      setProgress(15);

      // Step 2: PUT file directly to S3
      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("File upload to storage failed.");
      }

      setProgress(30);
      setPhase("processing");
      setSseStatus("processing");

      // Step 3: Open SSE for job progress
      const es = connectJobSSE(
        job_id,
        (event) => {
          if (event.event === "progress") {
            const pct = event.progress_pct ?? 50;
            setProgress(Math.max(30, pct));
            // Map to named status
            if (pct < 50) setSseStatus("processing");
            else if (pct < 85) setSseStatus("analysing");
          } else if (event.event === "complete") {
            setProgress(100);
            setSseStatus("complete");
            setPhase("complete");
            const finalSessionId = event.session_id ?? session_id;
            if (finalSessionId) {
              localStorage.setItem(
                "revizr_last_diagnostic_session_id",
                finalSessionId
              );
              setTimeout(() => {
                router.push(`/diagnostic/results/${finalSessionId}`);
              }, 800);
            }
          } else if (event.event === "failed") {
            setSseStatus("failed");
            setPhase("error");
            setError(event.error ?? "Processing failed. Please try again.");
          }
        },
        () => {
          if (phase !== "complete") {
            setPhase("error");
            setError("Connection lost. Please try again.");
          }
        }
      );

      // Cleanup on unmount handled by EventSource lifecycle
      return () => es.close();
    } catch (ex) {
      setPhase("error");
      if (ex instanceof RevizrApiError) {
        setError(ex.apiError.message);
      } else if (ex instanceof Error) {
        setError(ex.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  }

  function handleRetry() {
    setFile(null);
    setPhase("idle");
    setError(undefined);
    setProgress(0);
    setSseStatus("pending");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const isActive = phase === "uploading" || phase === "processing";

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {(phase === "idle" || phase === "selected") && (
        <div
          ref={dropZoneRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center
            min-h-48 p-8 rounded-xl border-2 border-dashed
            transition-colors duration-fast cursor-pointer
            ${
              isDragOver
                ? "border-border-interactive bg-bg-brand-subtle"
                : "border-border-default bg-bg-surface hover:border-border-strong"
            }
          `}
        >
          <input
            ref={fileInputRef}
            id="report-file-input"
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            aria-label="Upload school report — PDF, JPEG, or PNG, maximum 10 MB"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleInputChange}
          />

          <span aria-hidden="true" className="text-4xl mb-3">
            {file ? "📄" : "📂"}
          </span>

          {file ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">
                {file.name}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {formatSize(file.size)}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPhase("idle");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="
                  mt-2 text-xs text-text-link hover:underline
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                  rounded-sm
                "
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">
                Drop your report here, or{" "}
                <span className="text-interactive-primary">browse</span>
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                PDF, JPEG, or PNG &middot; max 10 MB
              </p>
            </div>
          )}
        </div>
      )}

      {fileError && (
        <Alert variant="error">{fileError}</Alert>
      )}

      {/* Progress */}
      {isActive && (
        <div className="space-y-3" aria-live="polite" aria-atomic="true">
          <p className="text-sm font-semibold text-text-primary">
            {SSE_STATUS_LABELS[sseStatus]}
          </p>
          <Progress
            value={progress}
            aria-label={SSE_STATUS_LABELS[sseStatus]}
            variant="default"
          />
          <p className="text-xs text-text-tertiary">
            This usually takes under 2 minutes. Don&rsquo;t close this tab.
          </p>
        </div>
      )}

      {phase === "complete" && (
        <div className="space-y-3" aria-live="polite">
          <Progress value={100} aria-label="Complete" variant="success" />
          <p className="text-sm text-text-success font-semibold">
            Analysis complete! Redirecting…
          </p>
        </div>
      )}

      {phase === "error" && error && (
        <div className="space-y-4">
          <Alert variant="error">{error}</Alert>
          <Button variant="secondary" onClick={handleRetry} className="max-w-xs">
            Try again
          </Button>
        </div>
      )}

      {/* Submit */}
      {phase === "selected" && file && !fileError && (
        <Button onClick={handleSubmit} className="max-w-xs">
          Analyse my report
        </Button>
      )}
    </div>
  );
}
