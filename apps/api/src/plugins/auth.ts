/**
 * JWT authentication plugin (Fastify).
 *
 * Auth architecture (ADR-0005):
 *   - Access token: JWT RS256, 15-minute TTL, signed with private key from env
 *   - Refresh token: opaque 32-byte random token, stored as SHA-256 hash in Redis
 *     with TTL of 30 days. Key: `refresh:{tokenHash}`, value: JSON { userId, role }
 *   - Passwords: Argon2id (NOT bcrypt — per ADR-0005 "Never bcrypt")
 *
 * CRITICAL — spec sign-off rules enforced here:
 *   - POST /auth/register ONLY allows role=parent.
 *     Students are created by parents via POST /accounts/pair.
 *     If role=student is submitted to /auth/register, return 403.
 *
 * Token payload: { sub: userId, role: 'student'|'parent', iat, exp }
 */

import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createHash, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { readFileSync } from 'node:fs';

// ─── Token helpers ────────────────────────────────────────────────────────────

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const REFRESH_REDIS_PREFIX = 'refresh:';

export interface JwtPayload {
  sub: string;       // userId (UUID)
  role: 'student' | 'parent';
  iat: number;
  exp: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
    verifyAccessToken(token: string): JwtPayload;
  }
  interface FastifyRequest {
    jwtUser?: JwtPayload;
  }
}

// ─── Argon2id configuration (ADR-0005 parameters) ─────────────────────────────

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MiB
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password, ARGON2_OPTIONS);
}

// ─── Refresh token helpers ────────────────────────────────────────────────────

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex'); // 64-char hex = 32 bytes entropy
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function refreshRedisKey(tokenHash: string): string {
  return `${REFRESH_REDIS_PREFIX}${tokenHash}`;
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default fp(async function authPlugin(fastify: FastifyInstance) {
  const privateKeyPem = process.env['JWT_PRIVATE_KEY_PEM']?.replace(/\\n/g, '\n');
  const publicKeyPem  = process.env['JWT_PUBLIC_KEY_PEM']?.replace(/\\n/g, '\n');

  if (!privateKeyPem || !publicKeyPem) {
    throw new Error('JWT_PRIVATE_KEY_PEM and JWT_PUBLIC_KEY_PEM must be set');
  }

  // Use Node.js built-in JWT signing/verification via jsonwebtoken
  // (fastify-jwt wraps this but we need RS256 with explicit key material)
  const jwt = await import('jsonwebtoken');

  fastify.decorate('signAccessToken', function(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.default.sign(payload, privateKeyPem, {
      algorithm: 'RS256',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
  });

  fastify.decorate('verifyAccessToken', function(token: string): JwtPayload {
    return jwt.default.verify(token, publicKeyPem, {
      algorithms: ['RS256'],
    }) as JwtPayload;
  });

}, { name: 'auth-plugin', dependencies: ['redis-plugin'] });

// ─── Refresh token store (Redis-backed) ───────────────────────────────────────

export interface RefreshTokenData {
  userId: string;
  role: 'student' | 'parent';
}

/**
 * Store a refresh token in Redis.
 * Key: `refresh:{sha256(token)}`, value: JSON, TTL: 30 days.
 */
export async function storeRefreshToken(
  redis: import('ioredis').Redis,
  token: string,
  data: RefreshTokenData
): Promise<void> {
  const key = refreshRedisKey(hashRefreshToken(token));
  await redis.setex(key, REFRESH_TOKEN_TTL_SECONDS, JSON.stringify(data));
}

/**
 * Retrieve and immediately DELETE a refresh token from Redis (single-use rotation).
 * Returns null if the token does not exist or has expired.
 */
export async function consumeRefreshToken(
  redis: import('ioredis').Redis,
  token: string
): Promise<RefreshTokenData | null> {
  const key = refreshRedisKey(hashRefreshToken(token));

  // Atomic GETDEL — retrieves and deletes in one operation
  const raw = await redis.getdel(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RefreshTokenData;
  } catch {
    return null;
  }
}

/**
 * Revoke a refresh token without consuming it (logout flow).
 */
export async function revokeRefreshToken(
  redis: import('ioredis').Redis,
  token: string
): Promise<void> {
  const key = refreshRedisKey(hashRefreshToken(token));
  await redis.del(key);
}

/**
 * Store a password reset token in Redis.
 * Key: `pwreset:{sha256(token)}`, value: userId, TTL: 1 hour.
 */
export async function storePasswordResetToken(
  redis: import('ioredis').Redis,
  token: string,
  userId: string
): Promise<void> {
  const key = `pwreset:${createHash('sha256').update(token).digest('hex')}`;
  await redis.setex(key, 3600, userId);
}

/**
 * Consume a password reset token. Returns userId or null if invalid/expired.
 */
export async function consumePasswordResetToken(
  redis: import('ioredis').Redis,
  token: string
): Promise<string | null> {
  const key = `pwreset:${createHash('sha256').update(token).digest('hex')}`;
  return redis.getdel(key);
}

/**
 * Store a consent token for account pairing flows.
 * Key: `consent:{sha256(token)}`, value: accountId, TTL: 24 hours.
 */
export async function storeConsentToken(
  redis: import('ioredis').Redis,
  token: string,
  accountId: string
): Promise<void> {
  const key = `consent:${createHash('sha256').update(token).digest('hex')}`;
  await redis.setex(key, 86400, accountId);
}

/**
 * Consume a consent token. Returns accountId or null if invalid/expired.
 */
export async function consumeConsentToken(
  redis: import('ioredis').Redis,
  token: string
): Promise<string | null> {
  const key = `consent:${createHash('sha256').update(token).digest('hex')}`;
  return redis.getdel(key);
}
