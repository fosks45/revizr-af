/**
 * Rate limiting configuration per route group.
 *
 * Auth endpoints are tightly rate-limited (ADR-0005):
 *   - /auth/login, /auth/refresh: 10 attempts per 15 min per IP (T-012)
 *   - /auth/register: 5 per hour per IP
 *   - /users/me/export: 1 per 24 hours per user (GDPR rate limit, T-018)
 *
 * All other authenticated endpoints inherit the default: 100 req/min per IP.
 *
 * @fastify/rate-limit is registered in server.ts with these per-route overrides.
 */

export const rateLimitConfig = {
  /** Default for all routes */
  default: {
    max: 100,
    timeWindow: '1 minute',
  },

  /** Auth endpoints — tight limit to prevent credential stuffing */
  authLogin: {
    max: 10,
    timeWindow: '15 minutes',
    errorResponseBuilder: (_request: unknown, context: { max: number; after: string }) => ({
      code: 'RATE_LIMITED',
      message: `Too many login attempts. Try again in ${context.after}.`,
    }),
  },

  authRefresh: {
    max: 10,
    timeWindow: '15 minutes',
  },

  authRegister: {
    max: 5,
    timeWindow: '1 hour',
  },

  authForgotPassword: {
    max: 5,
    timeWindow: '1 hour',
  },

  /** GDPR export — 1 per 24h per user (enforced at route level via Redis key) */
  gdprExport: {
    max: 1,
    timeWindow: '24 hours',
    keyGenerator: (request: { jwtUser?: { sub?: string }; ip?: string }) =>
      `gdpr_export:${request.jwtUser?.sub ?? request.ip ?? 'unknown'}`,
  },
} as const;
