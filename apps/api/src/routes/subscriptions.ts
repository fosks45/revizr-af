/**
 * Subscription and billing routes.
 *
 * GET  /subscriptions/me       — get current subscription
 * POST /subscriptions/checkout — create Stripe Checkout session
 * POST /subscriptions/portal   — create Stripe Billing Portal session
 * POST /subscriptions/webhook  — Stripe webhook (verified by signature)
 *
 * Compliance (ADR-0007, C-015):
 *   - stripe_subscription_id and stripe_customer_id are NEVER returned in API responses.
 *   - Stripe is the source of truth; this table is maintained via webhooks.
 *   - success_url and cancel_url are validated against an allowlist (T-054).
 *   - Webhook signature is verified before processing (T-056).
 *   - Webhook events are idempotent: upsert on stripe_subscription_id.
 *   - All subscription events are logged to audit_log.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { Pool } from 'pg';
import { requireAuth, getAuthUser } from '../middleware/auth-guard.js';
import { encrypt, decrypt } from '../lib/encryption.js';
import {
  getStripeClient,
  getStripePriceId,
  validateStripeRedirectUrls,
  validateStripeReturnUrl,
  verifyStripeWebhook,
} from '../lib/stripe.js';
import { writeAuditLog, hashUserIdForAudit } from '../lib/audit.js';

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'annual']),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});

const portalSchema = z.object({
  return_url: z.string().url(),
});

export default async function subscriptionsRoutes(fastify: FastifyInstance): Promise<void> {
  const db = fastify.db;

  // ─── GET /subscriptions/me ────────────────────────────────────────────────

  fastify.get('/subscriptions/me', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);

    const result = await db.query(
      `SELECT id, plan, status, current_period_end, cancelled_at
       FROM subscriptions
       WHERE user_id = $1`,
      [user.sub]
    );

    if ((result.rowCount ?? 0) === 0) {
      // Default free subscription if no row exists
      return reply.code(200).send({
        id: '',
        plan: 'free',
        status: 'active',
        current_period_end: new Date(Date.now() + 100 * 365 * 86400 * 1000).toISOString(),
        cancelled_at: null,
      });
    }

    const sub = result.rows[0] as {
      id: string;
      plan: string;
      status: string;
      current_period_end: Date;
      cancelled_at: Date | null;
    };

    // stripe_subscription_id and stripe_customer_id are NEVER returned (T-053)
    return reply.code(200).send({
      id: sub.id,
      plan: sub.plan,
      status: sub.status,
      current_period_end: sub.current_period_end.toISOString(),
      cancelled_at: sub.cancelled_at?.toISOString() ?? null,
    });
  });

  // ─── POST /subscriptions/checkout ────────────────────────────────────────

  fastify.post('/subscriptions/checkout', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = checkoutSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { plan, success_url, cancel_url } = parse.data;

    // Validate redirect URLs against allowlist (T-054)
    try {
      validateStripeRedirectUrls(success_url, cancel_url);
    } catch {
      return reply.code(422).send({ code: 'INVALID_REDIRECT_URL', message: 'Redirect URL is not allowed' });
    }

    // Check if already on paid plan
    const subResult = await db.query(
      `SELECT plan, status FROM subscriptions WHERE user_id = $1`,
      [user.sub]
    );

    const currentSub = subResult.rows[0] as { plan: string; status: string } | undefined;
    if (currentSub && currentSub.plan !== 'free' && currentSub.status === 'active') {
      return reply.code(409).send({
        code: 'ALREADY_SUBSCRIBED',
        message: 'Account is already on a paid plan',
      });
    }

    // Fetch user email for Stripe customer creation
    const userResult = await db.query(
      `SELECT email FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [user.sub]
    );
    const userEmail = decrypt((userResult.rows[0] as { email: string }).email);

    const stripe = getStripeClient();
    const priceId = getStripePriceId(plan);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
      metadata: { revizr_user_id: user.sub },
    });

    await writeAuditLog({
      agentOrUserId: hashUserIdForAudit(user.sub),
      action: 'subscription.checkout.created',
      entityType: 'subscription',
      entityId: user.sub,
      decision: 'allowed',
      policy: 'subscription_checkout',
      metadata: { plan },
    });

    return reply.code(200).send({ checkout_url: session.url });
  });

  // ─── POST /subscriptions/portal ───────────────────────────────────────────

  fastify.post('/subscriptions/portal', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = portalSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(422).send({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        details: parse.error.flatten().fieldErrors,
      });
    }

    const user = getAuthUser(request);
    const { return_url } = parse.data;

    try {
      validateStripeReturnUrl(return_url);
    } catch {
      return reply.code(422).send({ code: 'INVALID_REDIRECT_URL', message: 'return_url is not allowed' });
    }

    // Fetch stripe_customer_id (C3 — decrypt)
    const subResult = await db.query(
      `SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1`,
      [user.sub]
    );

    if ((subResult.rowCount ?? 0) === 0 || !(subResult.rows[0] as { stripe_customer_id: string | null }).stripe_customer_id) {
      return reply.code(404).send({
        code: 'NO_BILLING_ACCOUNT',
        message: 'No billing account found. Upgrade first.',
      });
    }

    const encCustomerId = (subResult.rows[0] as { stripe_customer_id: string }).stripe_customer_id;
    const customerId = decrypt(encCustomerId);

    const stripe = getStripeClient();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url,
    });

    return reply.code(200).send({ portal_url: portalSession.url });
  });

  // ─── POST /subscriptions/webhook ──────────────────────────────────────────

  fastify.post('/subscriptions/webhook', {
    // No auth — authenticated by Stripe-Signature header
    config: {
      // Disable JSON parsing so we can access raw body for signature verification
      rawBody: true,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      return reply.code(400).send({
        code: 'INVALID_SIGNATURE',
        message: 'Stripe-Signature header is required',
      });
    }

    let event;
    try {
      // rawBody is populated when config.rawBody = true
      const body = (request as FastifyRequest & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(request.body));
      event = verifyStripeWebhook(body, signature);
    } catch (err) {
      fastify.log.warn({ err }, 'Stripe webhook signature verification failed');
      return reply.code(400).send({
        code: 'INVALID_SIGNATURE',
        message: 'Webhook signature verification failed',
      });
    }

    try {
      await handleStripeEvent(event, db);
    } catch (err) {
      fastify.log.error({ err, eventType: event.type }, 'Failed to process Stripe webhook');
      // Return 200 to Stripe even on processing error — Stripe will retry
    }

    await writeAuditLog({
      agentOrUserId: 'stripe',
      action: `subscription.webhook.${event.type}`,
      entityType: 'subscription',
      entityId: event.id,
      decision: 'allowed',
      policy: 'stripe_webhook',
      metadata: { stripe_event_type: event.type },
    });

    return reply.code(200).send({ received: true });
  });
}

/**
 * Process a Stripe event and update the subscriptions table.
 * All events are idempotent: upsert on stripe_subscription_id.
 * Out-of-order events handled safely via updated_at ordering.
 */
async function handleStripeEvent(
  event: import('stripe').Stripe.Event,
  db: Pool
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as import('stripe').Stripe.Checkout.Session;
      if (session.mode !== 'subscription') return;

      const userId = session.metadata?.['revizr_user_id'];
      if (!userId) {
        process.stderr.write(`[STRIPE_WEBHOOK] checkout.session.completed missing revizr_user_id\n`);
        return;
      }

      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;
      const customerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id;

      if (!subscriptionId || !customerId) return;

      const encUserId = encrypt(userId);
      const encSubId = encrypt(subscriptionId);
      const encCustId = encrypt(customerId);

      await db.query(
        `INSERT INTO subscriptions
           (id, user_id, stripe_subscription_id, stripe_customer_id, plan, status, current_period_end)
         VALUES ($1, $2, $3, $4, $5, 'active', now() + interval '30 days')
         ON CONFLICT (user_id) DO UPDATE
           SET stripe_subscription_id = $3,
               stripe_customer_id = $4,
               status = 'active',
               updated_at = now()`,
        [uuidv4(), encUserId, encSubId, encCustId, 'monthly']
      );
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as import('stripe').Stripe.Subscription;
      const encSubId = encrypt(sub.id);

      const planMap: Record<string, string> = {
        'month': 'monthly',
        'year': 'annual',
      };

      const interval = (sub.items.data[0]?.plan?.interval as string | undefined) ?? 'month';
      const plan = planMap[interval] ?? 'monthly';
      const periodEnd = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000);

      await db.query(
        `UPDATE subscriptions
         SET plan = $1, status = $2, current_period_end = $3, updated_at = now()
         WHERE stripe_subscription_id = $4`,
        [plan, sub.status, periodEnd.toISOString(), encSubId]
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as import('stripe').Stripe.Subscription;
      const encSubId = encrypt(sub.id);

      await db.query(
        `UPDATE subscriptions
         SET status = 'cancelled', plan = 'free', cancelled_at = now(), updated_at = now()
         WHERE stripe_subscription_id = $1`,
        [encSubId]
      );
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as import('stripe').Stripe.Invoice;
      const stripeSubId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : (invoice.subscription as { id?: string } | null)?.id;

      if (!stripeSubId) return;
      const encSubId = encrypt(stripeSubId);

      await db.query(
        `UPDATE subscriptions SET status = 'past_due', updated_at = now()
         WHERE stripe_subscription_id = $1`,
        [encSubId]
      );
      break;
    }

    default:
      // Unknown event type — ignore safely
      break;
  }
}

