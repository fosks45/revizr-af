/**
 * Subscription management page.
 *
 * Anti-dark-pattern compliance (spec requirement):
 * - Cancel confirmation uses equal-weight language
 * - Primary action: "Keep my plan" (prominent)
 * - Secondary action: "Cancel at end of period" (clearly labelled)
 * - No confusing copy, no pre-ticked opt-outs
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  getMySubscription,
  createCheckoutSession,
  createBillingPortalSession,
  type Subscription,
  RevizrApiError,
} from "@/lib/api";

const PLAN_LABELS: Record<Subscription["plan"], string> = {
  free: "Free",
  monthly: "Monthly",
  annual: "Annual",
};

const STATUS_LABELS: Record<Subscription["status"], string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Payment overdue",
  cancelled: "Cancelled",
  incomplete: "Incomplete",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type DialogState = "none" | "confirm-cancel";

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [dialog, setDialog] = useState<DialogState>("none");

  useEffect(() => {
    async function load() {
      try {
        const sub = await getMySubscription();
        setSubscription(sub);
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.push("/login");
        } else {
          setError("Unable to load subscription details.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [router]);

  async function handleUpgrade(plan: "monthly" | "annual") {
    setIsActing(true);
    setError(undefined);
    try {
      const { checkout_url } = await createCheckoutSession({
        plan,
        success_url: `${window.location.origin}/account/subscription?upgraded=1`,
        cancel_url: `${window.location.origin}/account/subscription`,
      });
      window.location.href = checkout_url;
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        setError(ex.apiError.message);
      } else {
        setError("Unable to start checkout. Please try again.");
      }
      setIsActing(false);
    }
  }

  async function handleManage() {
    setIsActing(true);
    setError(undefined);
    try {
      const { portal_url } = await createBillingPortalSession(
        `${window.location.origin}/account/subscription`
      );
      window.location.href = portal_url;
    } catch (ex) {
      if (ex instanceof RevizrApiError) {
        setError(ex.apiError.message);
      } else {
        setError("Unable to open billing portal. Please try again.");
      }
      setIsActing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <p className="text-text-tertiary text-sm" aria-live="polite">
          Loading subscription…
        </p>
      </div>
    );
  }

  const isPaid =
    subscription?.plan === "monthly" || subscription?.plan === "annual";

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="text-xl font-bold text-text-primary mb-6">
        Subscription
      </h1>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Current plan */}
      <Card className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">
              Your plan
            </h2>
            <p className="text-lg font-bold text-text-primary">
              {subscription ? PLAN_LABELS[subscription.plan] : "—"}
            </p>
            {subscription && (
              <p className="text-xs text-text-tertiary mt-1">
                Status:{" "}
                <span className="text-text-secondary">
                  {STATUS_LABELS[subscription.status]}
                </span>
                {subscription.current_period_end && isPaid && (
                  <>
                    {" "}
                    &middot; Renews{" "}
                    {formatDate(subscription.current_period_end)}
                  </>
                )}
                {subscription.cancelled_at && (
                  <>
                    {" "}
                    &middot; Cancels{" "}
                    {formatDate(subscription.current_period_end)}
                  </>
                )}
              </p>
            )}
          </div>
          {subscription && (
            <Badge
              variant={isPaid ? "strong" : "neutral"}
              showIcon
            >
              {PLAN_LABELS[subscription.plan]}
            </Badge>
          )}
        </div>
      </Card>

      {!isPaid ? (
        /* Upgrade options */
        <section aria-labelledby="upgrade-heading">
          <h2
            id="upgrade-heading"
            className="text-md font-semibold text-text-primary mb-2"
          >
            Unlock your full question pack
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Access every past paper question, unlimited practice sessions, and
            detailed progress reports.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card elevated className="flex flex-col">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Monthly
              </h3>
              <p className="text-2xl font-bold text-text-primary mb-1">
                £19.99
              </p>
              <p className="text-xs text-text-tertiary mb-6">per month</p>
              <Button
                onClick={() => handleUpgrade("monthly")}
                isLoading={isActing}
                disabled={isActing}
                className="mt-auto"
              >
                Subscribe monthly
              </Button>
            </Card>

            <Card elevated className="flex flex-col border-border-interactive">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-text-primary">
                  Annual
                </h3>
                <Badge variant="accent">Save 25%</Badge>
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">
                £179
              </p>
              <p className="text-xs text-text-tertiary mb-6">
                per year (£14.92/month)
              </p>
              <Button
                onClick={() => handleUpgrade("annual")}
                isLoading={isActing}
                disabled={isActing}
                className="mt-auto"
              >
                Subscribe annually
              </Button>
            </Card>
          </div>
        </section>
      ) : (
        /* Manage existing subscription */
        <div className="space-y-4">
          <Button
            variant="secondary"
            onClick={handleManage}
            isLoading={isActing}
            disabled={isActing}
            className="max-w-xs"
          >
            Manage subscription
          </Button>

          {!subscription?.cancelled_at && (
            <div>
              <button
                type="button"
                onClick={() => setDialog("confirm-cancel")}
                className="
                  text-sm text-text-tertiary hover:text-text-error
                  underline underline-offset-2
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                  rounded-sm transition-colors duration-fast
                "
              >
                Cancel subscription
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cancel confirmation dialog — no dark patterns */}
      {dialog === "confirm-cancel" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
          aria-describedby="cancel-dialog-desc"
          className="
            fixed inset-0 z-modal flex items-center justify-center p-4
            bg-black/40
          "
        >
          <div className="bg-bg-surface rounded-lg shadow-modal max-w-sm w-full p-6">
            <h2
              id="cancel-dialog-title"
              className="text-md font-bold text-text-primary mb-2"
            >
              Cancel your subscription?
            </h2>
            <p
              id="cancel-dialog-desc"
              className="text-sm text-text-secondary mb-6"
            >
              You&rsquo;ll keep full access until{" "}
              {subscription?.current_period_end
                ? formatDate(subscription.current_period_end)
                : "the end of your billing period"}
              . After that, your account reverts to the free plan.
            </p>
            <div className="flex flex-col gap-3">
              {/* Primary: keep the plan */}
              <Button
                onClick={() => setDialog("none")}
                className="w-full"
              >
                Keep my plan
              </Button>
              {/* Secondary: proceed with cancel — clearly labelled */}
              <Button
                variant="secondary"
                onClick={() => {
                  setDialog("none");
                  void handleManage(); // Opens Stripe portal for cancellation
                }}
                className="w-full"
              >
                Cancel at end of period
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
