import fp from 'fastify-plugin';    
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default fp(async (fastify, opts) => {
  // Make Prisma Client available through Fastify instance
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (fastifyInstance) => {
    await prisma.$disconnect();
  });
}); 