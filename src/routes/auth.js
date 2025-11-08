import {signupSchema, loginSchema} from '../utils/validation.js';
import {createUser, authenticateUser} from '../services/userService.js';

export default async function authRoutes(fastify){
    //for sign up authentication
    fastify.post('/auth/signup', async (request, reply) => {
        const { error, value } = signupSchema.validate(request.body);
    if (error) return reply.code(400).send({ error: error.details.map(e => e.message) });

    try {
        const user = await createUser(fastify, value);
        reply.code(201).send({user});
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
    });

    //for login authentication
    fastify.post('/auth/login', async (request, reply) => {
        const { error, value } = loginSchema.validate(request.body);
    if (error) return reply.code(400).send({ error: error.details.map(e => e.message) });   
    try {
        const result = await authenticateUser(fastify, value);
        reply.send(result);
    } catch (err) {
        reply.code(401).send({ error: err.message });
    }
    });                                                                             
}