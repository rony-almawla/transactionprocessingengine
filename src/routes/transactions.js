import { processTransactions, getAnalytics } from '../services/transactionService.js';

export default async function transactionRoutes(fastify) {
  fastify.post('/transactions', {
    preValidation: [fastify.authenticate], // require JWT authentication for this route
    handler: async (request, reply) => {
      try {
        const transactions = request.body;

        // use processTransactions service to validate, rate-limit, and store
        const result = await processTransactions(fastify, transactions);

        // if any transaction exceeded rate limit  return HTTP 429
        if (result.rateLimit) {
          fastify.log.warn('Rate limit exceeded for one or more sources');
          return reply.code(429).send({
            message: 'Rate limit exceeded for one or more sources',
            result,
          });
        }

        // otherwise success
        return reply.code(200).send(result);
      } catch (err) {
        fastify.log.error({ err }, 'Error processing transactions');
        return reply.code(500).send({
          error: 'Internal Server Error',
          details: err.message,
        });
      }
    },
  });

  // GET analytics  to return transaction analytics
  fastify.get('/analytics', {
    preValidation: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const data = await getAnalytics(fastify);
        return reply.send(data);
      } catch (err) {
        fastify.log.error({ err }, 'Error retrieving analytics');
        return reply.code(500).send({
          error: 'Failed to compute analytics',
          details: err.message,
        });
      }
    },
  });
}
