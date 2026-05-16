/**
 * PostgreSQL connection pool plugin (Fastify).
 * Uses `pg` (node-postgres) via a pool registered as a Fastify decorator.
 *
 * Data residency: DATABASE_URL must point to eu-west-2 RDS. The server
 * startup check in server.ts enforces AWS_DEFAULT_REGION=eu-west-2.
 *
 * The pool is exposed on `fastify.db` and passed to `initAuditWriter`.
 */

import fp from 'fastify-plugin';
import { Pool } from 'pg';
import type { FastifyInstance } from 'fastify';
import { initAuditWriter } from '../lib/audit.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool;
  }
}

export default fp(async function dbPlugin(fastify: FastifyInstance) {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    // Ensure SSL in production
    ssl: process.env['NODE_ENV'] === 'production'
      ? { rejectUnauthorized: true }
      : undefined,
  });

  // Verify connectivity on startup
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    fastify.log.info('PostgreSQL connection pool established');
  } finally {
    client.release();
  }

  // Register pool as a Fastify decorator
  fastify.decorate('db', pool);

  // Wire audit writer
  initAuditWriter(pool);

  // Drain pool on shutdown
  fastify.addHook('onClose', async () => {
    await pool.end();
    fastify.log.info('PostgreSQL connection pool closed');
  });
}, { name: 'db-plugin' });
