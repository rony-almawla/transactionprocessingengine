import Fastify from 'fastify';
import dotenv from 'dotenv';

import prismaPlugin from './plugins/prisma.js';
import jwtPlugin from './plugins/jwt.js';
import redisPlugin from './plugins/redis.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';

dotenv.config();

export function build(opts = {}) {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
    ...opts,
  });

  fastify.register(prismaPlugin);
  fastify.register(jwtPlugin);
  fastify.register(redisPlugin, { url: process.env.REDIS_URL });

  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(transactionRoutes);

  fastify.get('/health', async (_, reply) => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      let redis = 'not-configured';
      if (fastify.redis) {
        redis =
          fastify.redis.status === 'ready'
            ? 'connected'
            : fastify.redis.status;
      }
      reply.send({ status: 'ok', database: 'connected', redis });
    } catch (err) {
      fastify.log.error({ err }, 'health check failed');
      reply
        .code(500)
        .send({ status: 'error', database: 'disconnected', error: err.message });
    }
  });

  return fastify;
}

// to start my applicatuon: node src/server.js
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const fastify = build();
  const port = Number(process.env.PORT) || 4000;

  fastify.listen({ port }, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`Server running at ${address}`);
  });
}
