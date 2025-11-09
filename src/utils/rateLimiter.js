export const checkRateLimit = async (fastify, source) => {
  const key = `rate_limit:${source}`;
  const limit = 100;
  const windowSeconds = 5 * 60; // we have to transfomr the minutes to seconds

  try {
    if (fastify.redis) {
      const count = await fastify.redis.incr(key);
      if (count === 1) await fastify.redis.expire(key, windowSeconds);
      const ok = count <= limit;
      if (!ok) fastify.log.warn({ source, count }, 'Rate limit exceeded (Redis)');
      return { ok, count, store: 'redis' };
    }
    throw new Error('Redis unavailable');
  } catch {
    if (!fastify.rateLimitMap) fastify.rateLimitMap = new Map();
    const now = Date.now();
    const entry =
      fastify.rateLimitMap.get(source) || { count: 0, reset: now + windowSeconds * 1000 };

    if (entry.reset <= now) {
      entry.count = 1;
      entry.reset = now + windowSeconds * 1000;
    } else {
      entry.count++;
    }

    fastify.rateLimitMap.set(source, entry);
    const ok = entry.count <= limit;
    if (!ok) fastify.log.warn({ source, count: entry.count }, 'Rate limit exceeded (memory)');
    return { ok, count: entry.count, store: 'memory' };
  }
};
