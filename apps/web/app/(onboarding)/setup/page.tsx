/**
 * Setup page — parent adds a student account.
 *
 * Shows ParentalConsentBanner above the form.
 * Derives age_band from year/month of birth (year + month only — no day).
 */

import type { Metadata } from "next";
import { ParentalConsentBanner } from "@/components/auth/ParentalConsentBanner";
import { SetupStudentForm } from "@/components/auth/SetupStudentForm";

export const metadata: Metadata = {
  title: "Add your child's account",
};

export default function SetupPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Add your child&rsquo;s revision account
        </h1>
        <p className="text-sm text-text-secondary">
          This creates your child&rsquo;s revision account. You control it.
        </p>
      </div>

      <ParentalConsentBanner className="mb-6" />

      <SetupStudentForm />
    </>
  );
}
