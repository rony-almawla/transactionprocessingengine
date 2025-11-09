import fp from 'fastify-plugin';
import Redis from 'ioredis';

export default fp(async (fastify, opts) => {
  const url = opts.url || process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  let client = null;
  try {
    client = new Redis(url);

    client.on('connect', () => fastify.log.info('Redis connected'));
    client.on('ready', () => fastify.log.info('Redis ready'));
    client.on('error', (err) => fastify.log.error({ err }, 'Redis error'));
  } catch (err) {
    fastify.log.warn({ err }, 'Failed to initialize Redis');
    client = null;
  }

  fastify.decorate('redis', client);

  fastify.addHook('onClose', async (_, done) => {
    if (client) {
      try {
        await client.quit();
      } catch (err) {
        fastify.log.warn({ err }, 'Error closing Redis connection');
      }
    }
    done();
  });
});
