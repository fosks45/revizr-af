/**
 * Subject selection page — student selects up to 10 subjects with exam board + level.
 */

import type { Metadata } from "next";
import { SubjectSetupForm } from "@/components/onboarding/SubjectSetupForm";

export const metadata: Metadata = {
  title: "Choose your subjects",
};

export default function SubjectsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Which exam are you preparing for?
        </h1>
        <p className="text-sm text-text-secondary">
          Select up to 10 subjects. You can add more later.
        </p>
      </div>

      <SubjectSetupForm />
    </>
  );
}
