import fp from "fastify-plugin";
import Redis from "ioredis";

export default fp(async (fastify, opts) => {
    const redis = new Redis({
        host: opts.host || '127.0.0.1',
        port: opts.port || 6379,
    });

    redis.on('error', (err) => fastify.log.error('Redis error:', err));

    fastify.decorate("redis", redis);

    fastify.addHook('onClose', async (instance, done) => {
        await redis.quit();
        done();
    });
});
