/**
 * Stripe client and billing helpers.
 *
 * Compliance notes (ADR-0007, C-015):
 *   - No card data is stored in Revizr's database. Stripe is the source of truth.
 *   - stripe_customer_id and stripe_subscription_id are C3 fields (encrypted at rest).
 *   - They are NEVER returned in API responses (T-053 acceptance criterion).
 *   - success_url and cancel_url are validated against an allowlist to prevent open redirects.
 *   - Webhook signature is verified before any event is processed (T-056).
 */

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!_stripe) {
    const key = process.env['STRIPE_SECRET_KEY'];
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });
  }
  return _stripe;
}

/** Allowed URL origin for Stripe redirects. Prevents open-redirect attacks. */
function isAllowedRedirectUrl(url: string): boolean {
  const allowedOrigins = (process.env['STRIPE_ALLOWED_REDIRECT_ORIGINS'] ?? '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  try {
    const parsed = new URL(url);
    return allowedOrigins.some(origin => parsed.origin === origin);
  } catch {
    return false;
  }
}

/**
 * Validate success_url and cancel_url against the allowlist.
 * Throws if either URL is not on the allowlist (T-054 acceptance criterion).
 */
export function validateStripeRedirectUrls(successUrl: string, cancelUrl: string): void {
  if (!isAllowedRedirectUrl(successUrl)) {
    throw Object.assign(new Error('success_url is not on the allowed redirect origin list'), {
      code: 'INVALID_REDIRECT_URL',
    });
  }
  if (!isAllowedRedirectUrl(cancelUrl)) {
    throw Object.assign(new Error('cancel_url is not on the allowed redirect origin list'), {
      code: 'INVALID_REDIRECT_URL',
    });
  }
}

/**
 * Validate return_url for billing portal sessions.
 */
export function validateStripeReturnUrl(returnUrl: string): void {
  if (!isAllowedRedirectUrl(returnUrl)) {
    throw Object.assign(new Error('return_url is not on the allowed redirect origin list'), {
      code: 'INVALID_REDIRECT_URL',
    });
  }
}

/** Map our plan names to Stripe Price IDs (set via env in production). */
export function getStripePriceId(plan: 'monthly' | 'annual'): string {
  const key = plan === 'monthly' ? 'STRIPE_PRICE_ID_MONTHLY' : 'STRIPE_PRICE_ID_ANNUAL';
  const priceId = process.env[key];
  if (!priceId) {
    throw new Error(`${key} is not configured`);
  }
  return priceId;
}

/**
 * Verify a Stripe webhook signature.
 * Returns the parsed Stripe.Event on success; throws on invalid signature.
 */
export function verifyStripeWebhook(
  payload: Buffer | string,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }
  return getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret);
}
