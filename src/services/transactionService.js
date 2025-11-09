import { transactionSchema } from "../utils/transactionValidation.js";
import { checkFraud } from "./fraudDetectionService.js";
import { checkRateLimit } from "../utils/rateLimiter.js";

export const processTransactions = async (fastify, transactionsInput) => {
  const txs = Array.isArray(transactionsInput) ? transactionsInput : [transactionsInput];

  const settled = await Promise.allSettled(
    txs.map(async (rawTx) => {
      // Ensure timestamp is set correctly
      const tx = {
        ...rawTx,
        currency: rawTx.currency?.toUpperCase(),
        timestamp: rawTx.timestamp ? new Date(rawTx.timestamp) : new Date()
      };

      try {
        const { error, value } = transactionSchema.validate(tx, { convert: true });
        if (error) throw new Error(error.details.map(d => d.message).join(", "));

        const rate = await checkRateLimit(fastify.redis, value.source);
        if (!rate.ok) {
          return { success: false, txId: value.txId, code: 429, error: "Rate limit exceeded" };
        }

        const { isFraud, reasons } = await checkFraud(fastify, value);

        const created = await fastify.prisma.transaction.create({ data: value });

        if (isFraud) {
          for (const reason of reasons) {
            await fastify.prisma.fraudulentTransaction.create({ data: { txId: created.txId, reason } });
          }
        }

        return { success: true, tx: created, fraudReasons: reasons };
      } catch (err) {
        return { success: false, txId: tx?.txId || null, error: err.message };
      }
    })
  );

  const results = settled.map(r => (r.status === "fulfilled" ? r.value : { success: false, error: r.reason.message }));

  return {
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    details: results
  };
};

export const getAnalytics = async (fastify) => {
  const txs = await fastify.prisma.transaction.findMany();

  const volumeBySource = {};
  const destTotals = {};
  const txPerHour = {};

  for (const tx of txs) {
    volumeBySource[tx.source] = (volumeBySource[tx.source] || 0) + tx.amount;

    if (!destTotals[tx.destination]) destTotals[tx.destination] = { total: 0, count: 0 };
    destTotals[tx.destination].total += tx.amount;
    destTotals[tx.destination].count++;

    const hour = new Date(tx.timestamp).getUTCHours(); // FIXED: use timestamp
    txPerHour[hour] = (txPerHour[hour] || 0) + 1;
  }

  const avgAmountByDest = {};
  for (const [dest, data] of Object.entries(destTotals)) {
    avgAmountByDest[dest] = data.total / data.count;
  }

  return { volumeBySource, avgAmountByDest, txPerHour };
};
