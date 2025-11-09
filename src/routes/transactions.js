// import { processTransactions, getAnalytics } from '../services/transactionService.js';
// import { transactionSchema } from '../utils/transactionValidation.js';
// import joiToJsonSchema from 'joi-to-json-schema';

// export default async function transactionRoutes(fastify) {
//   const txJsonSchema = joiToJsonSchema(transactionSchema);

//   fastify.post('/transactions', {
//     schema: {
//       description: 'Create one or multiple transactions',
//       tags: ['Transactions'],
//       body: txJsonSchema,
//       response: {
//         200: { description: 'Transactions processed', type: 'object' },
//         429: { description: 'Rate limit exceeded' },
//         500: { description: 'Internal Server Error' },
//       },
//     },
//     preValidation: [fastify.authenticate],
//     handler: async (request, reply) => {
//       try {
//         const result = await processTransactions(fastify, request.body);
//         if (result.details.some(r => r.code === 429)) {
//           return reply.code(429).send({ message: 'Rate limit exceeded', result });
//         }
//         reply.send(result);
//       } catch (err) {
//         reply.code(500).send({ error: err.message });
//       }
//     },
//   });

//   fastify.get('/analytics', {
//     schema: {
//       description: 'Get aggregated analytics',
//       tags: ['Transactions'],
//       response: { 200: { type: 'object' }, 500: { type: 'object' } },
//     },
//     preValidation: [fastify.authenticate],
//     handler: async (request, reply) => {
//       try {
//         const data = await getAnalytics(fastify);
//         reply.send(data);
//       } catch (err) {
//         reply.code(500).send({ error: err.message });
//       }
//     },
//   });
// }

import { processTransactions, getAnalytics } from '../services/transactionService.js';

export default async function transactionRoutes(fastify) {
  fastify.post('/transactions', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Submit single or multiple transactions',
      body: {
        oneOf: [
          {
            type: 'object',
            properties: {
              txId: { type: 'string' },
              amount: { type: 'number' },
              currency: { type: 'string' },
              source: { type: 'string' },
              destination: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
            required: ['txId', 'amount', 'currency', 'source', 'destination', 'timestamp'],
          },
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                txId: { type: 'string' },
                amount: { type: 'number' },
                currency: { type: 'string' },
                source: { type: 'string' },
                destination: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
              },
              required: ['txId', 'amount', 'currency', 'source', 'destination', 'timestamp'],
            },
          },
        ],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'number' },
            failed: { type: 'number' },
            details: { type: 'array' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const transactions = request.body;
        const result = await processTransactions(fastify, transactions);

        if (result.details.some(d => d.code === 429)) {
          return reply.code(429).send({ message: 'Rate limit exceeded', result });
        }
        return reply.code(200).send(result);
      } catch (err) {
        return reply.code(500).send({ error: 'Internal Server Error', details: err.message });
      }
    },
  });

  fastify.get('/analytics', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Get aggregated transaction analytics',
      response: {
        200: {
          type: 'object',
          properties: {
            volumeBySource: { type: 'object' },
            avgAmountByDest: { type: 'object' },
            txPerHour: { type: 'object' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const data = await getAnalytics(fastify);
        return reply.send(data);
      } catch (err) {
        return reply.code(500).send({ error: 'Failed to compute analytics', details: err.message });
      }
    },
  });
}
