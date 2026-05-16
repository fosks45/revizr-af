/**
 * Redis connection plugin (Fastify).
 * Used by: BullMQ job queue, refresh token store.
 *
 * Redis must be in eu-west-2 (ElastiCache) in production.
 */

import fp from 'fastify-plugin';
import { Redis } from 'ioredis';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export default fp(async function redisPlugin(fastify: FastifyInstance) {
  const url = process.env['REDIS_URL'];
  if (!url) {
    throw new Error('REDIS_URL is not set');
  }

  const redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  await redis.ping();
  fastify.log.info('Redis connection established');

  fastify.decorate('redis', redis);

  fastify.addHook('onClose', async () => {
    await redis.quit();
    fastify.log.info('Redis connection closed');
  });
}, { name: 'redis-plugin' });
