import fastify, { FastifyError } from 'fastify';
import dotenv from 'dotenv';

import prismaPlugin from'./plugins/prisma.js ';
import jwtPlugin from'./plugins/jwt.js ';
import redisPlugin from'./plugins/redis.js ';

import authRoutes from'./routes/auth.js ';
import userRoutes from'./routes/user.js ';

dotenv.config();
const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(prismaPlugin);
fastify.register(jwtPlugin);
fastify.register(redisPlugin);

// Register routes
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(userRoutes, { prefix: '/users' });

//healtch check route
fastify.get('Health', async(__, reply)=>{
  try{
    await fastify.prisma.$queryRaw`SELECT 1`;
    reply.send({ status: 'ok', databse: 'connected' });
  } catch (error) {
    reply.status(500).send({ status: 'error', database: 'disconnected, error:err.message' });
  }
});

//to start the server of my application
fastify.listen({ port: process.env.PORT || 4000 }, (err, address) => {
  if (err) throw err;
  fastify.log.info(`Server running at ${address}`);
});