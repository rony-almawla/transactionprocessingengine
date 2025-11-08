import { checkAllRules } from "../utils/fraudRules.js";
import { checkRateLimit } from "../utils/rateLimiter.js";
import { transactionSchema } from "../utils/transactionValidation.js";

export const processTransactions = async (fastify, transactions) => {
    if (!Array.isArray(transactions)) transactions = [transactions];

    const results = await Promise.allSettled(transactions.map(async (tx) => {
        try {
            const { error, value } = transactionSchema.validate(tx);
            if (error) throw new Error(error.details.map(d => d.message).join(", "));

            const rateOk = await checkRateLimit(fastify, value.source);
            if (!rateOk) throw new Error("Rate limit exceeded");

            const fraudReasons = await checkAllRules(fastify, value);

            const createdTx = await fastify.prisma.transaction.create({
                data: {
                    ...value
                }
            });

            if (fraudReasons.length) {
                for (const reason of fraudReasons) {
                    await fastify.prisma.fraudulentTransaction.create({
                        data: { txId: value.txId, reason }
                    });
                }
            }

            return { success: true, tx: createdTx, fraudReasons };

        } catch (err) {
            return { success: false, error: err.message, tx };
        }
    }));

    const successCount = results.filter(r => r.status === "fulfilled" && r.value.success).length;
    const failCount = results.length - successCount;

    return {
        total: results.length,
        success: successCount,
        failed: failCount,
        details: results.map(r => r.value || r.reason)
    };
};

export const getAnalytics = async (fastify) => {
    const transactions = await fastify.prisma.transaction.findMany();

    const volumeBySource = transactions.reduce((acc, tx) => {
        acc[tx.source] = (acc[tx.source] || 0) + tx.amount;
        return acc;
    }, {});

    const avgAmountByDest = transactions.reduce((acc, tx) => {
        if (!acc[tx.destination]) acc[tx.destination] = { total: 0, count: 0 };
        acc[tx.destination].total += tx.amount;
        acc[tx.destination].count++;
        return acc;
    }, {});
    for (const dest in avgAmountByDest) {
        avgAmountByDest[dest] = avgAmountByDest[dest].total / avgAmountByDest[dest].count;
    }

    const txPerHour = transactions.reduce((acc, tx) => {
        const hour = tx.timestamp.getUTCHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});

    return { volumeBySource, avgAmountByDest, txPerHour };
};
