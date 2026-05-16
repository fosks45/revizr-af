/**
 * JWT verification middleware.
 *
 * Usage: register as a preHandler hook on any route requiring authentication.
 *
 * Attaches the verified JWT payload to `request.jwtUser`.
 * Returns 401 if the Authorization header is missing or the token is invalid/expired.
 *
 * Role-based guard helpers:
 *   - requireParent(request, reply): enforces role === 'parent'
 *   - requireOwnership(request, reply, ownerId): enforces the resource owner === caller
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { JwtPayload } from '../plugins/auth.js';

/**
 * Extract the Bearer token from the Authorization header.
 * Returns null if absent or malformed.
 */
function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

/**
 * preHandler hook: verify JWT access token and attach payload to request.
 * Register on any route that requires authentication.
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const token = extractBearerToken(request);
  if (!token) {
    return reply.code(401).send({
      code: 'UNAUTHORIZED',
      message: 'Missing Authorization header',
    });
  }

  try {
    request.jwtUser = request.server.verifyAccessToken(token);
  } catch {
    return reply.code(401).send({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired access token',
    });
  }
}

/**
 * preHandler hook: enforce that the authenticated user has role=parent.
 * Must be used AFTER requireAuth in the preHandler array.
 */
export async function requireParent(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.jwtUser || request.jwtUser.role !== 'parent') {
    return reply.code(403).send({
      code: 'FORBIDDEN',
      message: 'This endpoint requires a parent account',
    });
  }
}

/**
 * Assert that the authenticated user owns the resource (ownerId).
 * Returns 403 if ownership check fails.
 * Returns 401 if the user is not authenticated.
 */
export function assertOwnership(
  request: FastifyRequest,
  reply: FastifyReply,
  ownerId: string
): boolean {
  if (!request.jwtUser) {
    reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    return false;
  }
  if (request.jwtUser.sub !== ownerId) {
    reply.code(403).send({ code: 'FORBIDDEN', message: 'You do not have permission to access this resource' });
    return false;
  }
  return true;
}

/**
 * Get the authenticated user from the request.
 * Throws if not authenticated (should only be called after requireAuth).
 */
export function getAuthUser(request: FastifyRequest): JwtPayload {
  if (!request.jwtUser) {
    throw new Error('getAuthUser called on unauthenticated request');
  }
  return request.jwtUser;
}
