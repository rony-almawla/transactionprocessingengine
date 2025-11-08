import { updateUserSchema } from "../utils/validation.js";
import { getAllUser, getUserById, updateUser, deleteUser   } from "../services/userService.js";

export default async function userRoutes(fastify) {
    //all routes require JWT
    fastify.addHoook('onRequest', fastify.authenticate);

    //to get all the users where where only admin is permit to take actin
    fastify.get('/users', async (request, reply) => {
        if(request.user.role !== 'admin') return reply.code(403).send({error:'Forbidden to take such action'});

        const user = await getAllUser(fastify);
        reply.send({user});
    });

    //to get a single user by id
    fastify.get('users/:id', async (request, reply) => {
        const id = parseInt(request.params.id);
        const {userId, role} = request.user;

        if(userId !== id && role !== 'admin') {
            return reply.code(403).send({error: 'Forbidden to take such action'});
        }

        const user = await getUserById(fastify, id);
        if(!user) return reply.code(404).send({error: 'User not found'});   
        reply.send({user});
    });

    //to update a user while using the id
    fastify.put('/users/:id', async (request, reply) => {
        const id = parseInt(request.params.id);
        const {userId, role} = request.user;

        if(userId !== id && role !== 'admin') {
            return reply.code(403).send({error: 'Forbidden to take such action'});
        }
        const { error, value } = updateUserSchema.validate(request.body);
        if (error) return reply.code(400).send({ error: error.details.map(e => e.message) });

        const updated = await updateUser(fastify, id, value, role);
        reply.send({updated});
    });

    // to delete a user using the id
    fastify.delete('/users/:id', async (request, reply) => {
        if(request.user.role !== 'admin') {
            return reply.code(403).send({error: 'Forbidden to take such action'});
        }
        const id = parseInt(request.params.id);
        const result = await deleteUser(fastify, id);
        reply.send(result);
    });
}