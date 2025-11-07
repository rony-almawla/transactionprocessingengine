// src/server.js (CommonJS version)
const Fastify = require('fastify');
const dotenv = require('dotenv');

dotenv.config();

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 4000;

fastify.get('/', async () => ({ message: 'Server is running!' }));

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Server running at ${address}`);
});
