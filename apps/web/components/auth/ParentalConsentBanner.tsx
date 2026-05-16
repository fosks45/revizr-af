/**
 * ParentalConsentBanner — explains what data is collected about the child,
 * what the parent consents to, and links to the privacy policy.
 *
 * Must be visible and readable before the student account form (COPPA/GDPR-K).
 * Data class: C3 (child PII) — this banner describes C3 data collection.
 */

import { Alert } from "@/components/ui/Alert";

interface ParentalConsentBannerProps {
  className?: string;
}

export function ParentalConsentBanner({
  className = "",
}: ParentalConsentBannerProps) {
  return (
    <section
      aria-labelledby="consent-banner-heading"
      className={className}
    >
      <Alert variant="info">
        <h2
          id="consent-banner-heading"
          className="font-semibold text-text-primary mb-2"
        >
          About your child&rsquo;s account
        </h2>

        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            Creating a student account stores the following data about your
            child:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Their chosen display name</li>
            <li>Their approximate age group (not their exact date of birth)</li>
            <li>Their subjects, exam boards, and revision level</li>
            <li>Practice session records — questions answered and self-marks</li>
          </ul>

          <p>
            <strong>What we do not collect:</strong> full name, school name,
            photograph, or any location data.
          </p>

          <p>
            <strong>Your rights:</strong> As the parent or guardian, you can
            view, export, or permanently delete this data at any time from
            Account Settings.
          </p>

          <p className="text-xs text-text-tertiary">
            By adding a child account you confirm you are the parent or legal
            guardian of this child and consent to Revizr processing their data
            as described in our{" "}
            <a
              href="/privacy"
              className="text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </Alert>
    </section>
  );
}
