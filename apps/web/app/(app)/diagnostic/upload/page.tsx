/**
 * Diagnostic: school report upload flow.
 *
 * Steps:
 * 1. User selects / drops a file
 * 2. POST /diagnostic/upload → { jobId, uploadUrl }
 * 3. PUT file to S3 presigned URL
 * 4. Open SSE to /diagnostic/events/:jobId
 * 5. Progress bar driven by SSE events
 * 6. On complete → redirect to /diagnostic/results/:sessionId
 */

import type { Metadata } from "next";
import { ReportUpload } from "@/components/diagnostic/ReportUpload";

export const metadata: Metadata = {
  title: "Upload your school report",
};

export default function DiagnosticUploadPage() {
  return (
    <div className="page-container py-10">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Upload your school report
          </h1>
          <p className="text-sm text-text-secondary">
            We&rsquo;ll read your teacher&rsquo;s comments and build your topic map.
            Accepted formats: PDF, JPEG, PNG. Maximum 10&nbsp;MB.
          </p>
        </div>

        <ReportUpload />
      </div>
    </div>
  );
}
