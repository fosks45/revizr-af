/**
 * Parent dashboard — child selector, progress card, session log, plain-English summary.
 */

import type { Metadata } from "next";
import { ParentDashboardContent } from "@/components/parent/ParentDashboardContent";

export const metadata: Metadata = {
  title: "Parent dashboard",
};

export default function ParentDashboardPage() {
  return (
    <div className="page-container py-8">
      <h1 className="text-xl font-bold text-text-primary mb-6">
        Your children
      </h1>
      <ParentDashboardContent />
    </div>
  );
}
