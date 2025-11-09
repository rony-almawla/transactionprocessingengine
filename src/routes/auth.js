import { signupSchema, loginSchema } from '../utils/validation.js';
import { createUser, authenticateUser } from '../services/userService.js';

export default async function authRoutes(fastify) {
  fastify.post('/signup', {
    schema: {
      description: 'Register a new user',
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          role: { type: 'string', enum: ['user', 'admin'] },
        },
        required: ['email', 'password'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                role: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { error, value } = signupSchema.validate(request.body);
      if (error) return reply.code(400).send({ error: error.details.map(e => e.message) });

      try {
        const user = await createUser(fastify, value);
        reply.code(201).send({ user });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    },
  });

  fastify.post('/login', {
    schema: {
      description: 'Authenticate a user and get JWT',
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { error, value } = loginSchema.validate(request.body);
      if (error) return reply.code(400).send({ error: error.details.map(e => e.message) });
      try {
        const result = await authenticateUser(fastify, value);
        reply.send(result);
      } catch (err) {
        reply.code(401).send({ error: err.message });
      }
    },
  });
}
