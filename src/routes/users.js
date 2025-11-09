// import { updateUserSchema } from '../utils/validation.js';
// import { getAllUsers, getUserById, updateUser, deleteUser } from '../services/userService.js';
// import joiToJsonSchema from 'joi-to-json-schema';

// export default async function userRoutes(fastify) {
//   const updateUserJsonSchema = joiToJsonSchema(updateUserSchema);

//   // all routes require JWT
//   fastify.addHook('onRequest', fastify.authenticate);

//   // Get all users (admin only)
//   fastify.get('/users', {
//     schema: {
//       description: 'Get all users (admin only)',
//       tags: ['Users'],
//       response: { 200: { type: 'object', properties: { users: { type: 'array' } } }, 403: { type: 'object' } },
//     },
//     handler: async (request, reply) => {
//       if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden to take such action' });
//       const users = await getAllUsers(fastify);
//       reply.send({ users });
//     },
//   });

//   // Get single user
//   fastify.get('/users/:id', {
//     schema: {
//       description: 'Get user by ID',
//       tags: ['Users'],
//       response: { 200: { type: 'object', properties: { user: { type: 'object' } } }, 403: { type: 'object' }, 404: { type: 'object' } },
//     },
//     handler: async (request, reply) => {
//       const id = Number(request.params.id);
//       const { userId, role } = request.user;
//       if (userId !== id && role !== 'admin') return reply.code(403).send({ error: 'Forbidden to take such action' });
//       const user = await getUserById(fastify, id);
//       if (!user) return reply.code(404).send({ error: 'User not found' });
//       reply.send({ user });
//     },
//   });

//   // Update user
//   fastify.put('/users/:id', {
//     schema: {
//       description: 'Update a user',
//       tags: ['Users'],
//       body: updateUserJsonSchema,
//       response: { 200: { type: 'object', properties: { updated: { type: 'object' } } }, 400: { type: 'object' }, 403: { type: 'object' } },
//     },
//     handler: async (request, reply) => {
//       const id = Number(request.params.id);
//       const { userId, role } = request.user;
//       if (userId !== id && role !== 'admin') return reply.code(403).send({ error: 'Forbidden to take such action' });

//       const { error, value } = updateUserSchema.validate(request.body);
//       if (error) return reply.code(400).send({ error: error.details.map(e => e.message) });

//       const updated = await updateUser(fastify, id, value, role);
//       reply.send({ updated });
//     },
//   });

//   // Delete user (admin only)
//   fastify.delete('/users/:id', {
//     schema: {
//       description: 'Delete a user (admin only)',
//       tags: ['Users'],
//       response: { 200: { type: 'object' }, 403: { type: 'object' } },
//     },
//     handler: async (request, reply) => {
//       if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden to take such action' });
//       const id = Number(request.params.id);
//       const result = await deleteUser(fastify, id);
//       reply.send(result);
//     },
//   });
// }


import { getAllUsers, getUserById, updateUser, deleteUser } from '../services/userService.js';
import { updateUserSchema } from '../utils/validation.js';

export default async function userRoutes(fastify) {
  // Get all users
  fastify.get('/', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Get all users',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                  createdAt: { type: 'string' },
                },
              },
            },
            total: { type: 'number' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const users = await getAllUsers(fastify, request.query);
        reply.send(users);
      } catch (err) {
        reply.code(500).send({ error: err.message });
      }
    },
  });

  // Get user by ID
  fastify.get('/:id', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Get a user by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
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
      try {
        const user = await getUserById(fastify, Number(request.params.id));
        if (!user) return reply.code(404).send({ error: 'User not found' });
        reply.send({ user });
      } catch (err) {
        reply.code(500).send({ error: err.message });
      }
    },
  });

  // Update user
  fastify.put('/:id', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Update a user',
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['user', 'admin'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
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
      const { error, value } = userUpdateSchema.validate(request.body);
      if (error) return reply.code(400).send({ error: error.details.map(e => e.message) });

      try {
        const updatedUser = await updateUser(fastify, Number(request.params.id), value);
        reply.send({ user: updatedUser });
      } catch (err) {
        reply.code(500).send({ error: err.message });
      }
    },
  });

  // Delete user
  fastify.delete('/:id', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Delete a user',
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        await deleteUser(fastify, Number(request.params.id));
        reply.send({ message: 'User deleted successfully' });
      } catch (err) {
        reply.code(500).send({ error: err.message });
      }
    },
  });
}
