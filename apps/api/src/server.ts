/**
 * Revizr API Server — Fastify bootstrap.
 *
 * Stack: Fastify 4, TypeScript strict, Node.js 22 LTS (ADR-0002).
 * Data residency enforcement: server refuses to start if AWS_DEFAULT_REGION != eu-west-2.
 *
 * Plugin registration order:
 *   1. redis (BullMQ + refresh token store)
 *   2. db (PostgreSQL pool + audit writer init)
 *   3. auth (JWT RS256 sign/verify decorators)
 *   4. cors, helmet, rate-limit
 *   5. Route prefixes
 *
 * Health check: GET /health → { status: 'ok', timestamp, region }
 * No auth on health check — used by load balancers and monitoring.
 *
 * Diagnostic worker: started alongside the server when WORKER_MODE=true
 * or when not explicitly disabled. In production, the worker runs as a
 * separate ECS task sharing the same Redis and DB connection strings.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import dbPlugin from './plugins/db.js';
import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';

import authRoutes from './routes/auth.js';
import accountsRoutes from './routes/accounts.js';
import usersRoutes from './routes/users.js';
import subjectsRoutes from './routes/subjects.js';
import diagnosticRoutes from './routes/diagnostic.js';
import practiceRoutes from './routes/practice.js';
import progressRoutes from './routes/progress.js';
import parentRoutes from './routes/parent.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import notificationsRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';

// ─── Data residency enforcement ───────────────────────────────────────────────

const AWS_REGION = process.env['AWS_DEFAULT_REGION'] ?? process.env['AWS_REGION'];
if (process.env['NODE_ENV'] === 'production' && AWS_REGION !== 'eu-west-2') {
  process.stderr.write(
    `[FATAL] AWS_DEFAULT_REGION must be eu-west-2 (data residency requirement, T-003). Got: ${AWS_REGION ?? 'undefined'}\n`
  );
  process.exit(1);
}

// ─── Server factory ───────────────────────────────────────────────────────────

export async function buildServer(): Promise<ReturnType<typeof Fastify>> {
  const fastify = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
      // Redact sensitive fields from logs — C3+/C6 fields must never appear in logs
      redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.new_password',
        'req.body.refresh_token',
        'req.body.consent_token',
        'req.body.token',
      ],
    },
    trustProxy: true, // ECS/ALB environment — trust X-Forwarded-For
    // Enable raw body for Stripe webhook signature verification
    ...(process.env['STRIPE_WEBHOOK_SECRET'] ? {} : {}),
  });

  // ─── Security headers ────────────────────────────────────────────────────

  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env['NODE_ENV'] === 'production' ? [] : null,
      },
    },
  });

  // ─── CORS ────────────────────────────────────────────────────────────────
  // F-SEC-004 FIX: Hard startup guard — fail fast if CORS_ORIGIN is unset in
  // production rather than silently disabling CORS (which blocks all browser clients).

  const corsOrigin = process.env['CORS_ORIGIN'];
  if (!corsOrigin && process.env['NODE_ENV'] === 'production') {
    throw new Error('CORS_ORIGIN env var is required in production. Set it to the app domain (e.g. https://revizr.com).');
  }

  await fastify.register(cors, {
    origin: corsOrigin ?? false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ─── Rate limiting (global default) ──────────────────────────────────────

  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      code: 'RATE_LIMITED',
      message: `Too many requests. Retry after ${context.after}.`,
    }),
  });

  // ─── Infrastructure plugins ───────────────────────────────────────────────

  await fastify.register(redisPlugin);
  await fastify.register(dbPlugin);
  await fastify.register(authPlugin);

  // ─── Cache-Control: no-store, private on all API responses ───────────────
  // (T-008 acceptance criterion — no API response cached at CDN edge)

  fastify.addHook('onSend', async (_request, reply) => {
    // Skip SSE streams and static responses
    if (!reply.hasHeader('Cache-Control')) {
      void reply.header('Cache-Control', 'no-store, private');
    }
    return;
  });

  // ─── Health check ────────────────────────────────────────────────────────

  fastify.get('/health', { logLevel: 'warn' }, async (_request, reply) => {
    return reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      region: AWS_REGION ?? 'unknown',
    });
  });

  // ─── API routes (all prefixed with /v1) ──────────────────────────────────

  await fastify.register(authRoutes,          { prefix: '/v1' });
  await fastify.register(accountsRoutes,      { prefix: '/v1' });
  await fastify.register(usersRoutes,         { prefix: '/v1' });
  await fastify.register(subjectsRoutes,      { prefix: '/v1' });
  await fastify.register(diagnosticRoutes,    { prefix: '/v1' });
  await fastify.register(practiceRoutes,      { prefix: '/v1' });
  await fastify.register(progressRoutes,      { prefix: '/v1' });
  await fastify.register(parentRoutes,        { prefix: '/v1' });
  await fastify.register(subscriptionsRoutes, { prefix: '/v1' });
  await fastify.register(notificationsRoutes, { prefix: '/v1' });
  await fastify.register(settingsRoutes,      { prefix: '/v1' });

  // ─── 404 handler ─────────────────────────────────────────────────────────

  fastify.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({ code: 'NOT_FOUND', message: 'Route not found' });
  });

  // ─── Global error handler ─────────────────────────────────────────────────

  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error({ err: error }, 'Unhandled route error');
    return reply.code(500).send({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
  });

  return fastify;
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const fastify = await buildServer();
  const port = parseInt(process.env['PORT'] ?? '3001', 10);

  // Start diagnostic worker if not in worker-disabled mode
  if (process.env['DISABLE_WORKER'] !== 'true') {
    const { createDiagnosticWorker } = await import('./workers/diagnostic.worker.js');
    const worker = createDiagnosticWorker(fastify.redis, fastify.db);

    fastify.addHook('onClose', async () => {
      await worker.close();
    });

    fastify.log.info('Diagnostic BullMQ worker started');
  }

  await fastify.listen({ port, host: '0.0.0.0' });

  // ─── Graceful shutdown ────────────────────────────────────────────────────

  async function gracefulShutdown(signal: string): Promise<void> {
    fastify.log.info({ signal }, 'Received shutdown signal — beginning graceful shutdown');
    try {
      await fastify.close();
      fastify.log.info('Server closed gracefully');
      process.exit(0);
    } catch (err) {
      fastify.log.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  }

  process.once('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.once('SIGINT',  () => void gracefulShutdown('SIGINT'));
}

// Only run if this is the entry point (not imported as a module for tests)
// In CommonJS: require.main === module
if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`[FATAL] Server failed to start: ${String(err)}\n`);
    process.exit(1);
  });
}
