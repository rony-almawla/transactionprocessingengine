import { processTransactions, getAnalytics } from "../services/transactionService.js";

export default async function transactionRoutes(fastify) {
    fastify.addHook("onRequest", fastify.authenticate);

    fastify.post("/transactions", async (request, reply) => {
        const result = await processTransactions(fastify, request.body);
        reply.send(result);
    });

    fastify.get("/analytics", async (request, reply) => {
        const result = await getAnalytics(fastify);
        reply.send(result);
    });
}
