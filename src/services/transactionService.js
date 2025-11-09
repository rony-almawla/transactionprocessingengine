// import { checkAllRules } from '../utils/fraudRules.js';
// import { checkRateLimit } from '../utils/rateLimiter.js';
// import { transactionSchema } from '../utils/transactionValidation.js';

// export const processTransactions = async (fastify, transactionsInput) => {
//   const txs = Array.isArray(transactionsInput) ? transactionsInput : [transactionsInput];

//   const settled = await Promise.allSettled(
//     txs.map(async (rawTx) => {
//       const tx = { ...rawTx, currency: rawTx.currency?.toUpperCase() };
//       try {
//         const { error, value } = transactionSchema.validate(tx, { convert: true });
//         if (error) throw new Error(error.details.map((d) => d.message).join(', '));

//         const rate = await checkRateLimit(fastify, value.source);
//         if (!rate.ok) {
//           return { success: false, txId: value.txId, code: 429, error: 'Rate limit exceeded', details: rate };
//         }

//         const fraudReasons = await checkAllRules(fastify, value);

//         const created = await fastify.prisma.transaction.create({ data: value });
//         fastify.log.info({ txId: created.txId, source: created.source }, 'Transaction saved');

//         for (const reason of fraudReasons) {
//           await fastify.prisma.fraudulentTransaction.create({ data: { txId: created.txId, reason } });
//           fastify.log.warn({ txId: created.txId, reason }, 'Transaction flagged fraudulent');
//         }

//         return { success: true, tx: created, fraudReasons };
//       } catch (err) {
//         fastify.log.error({ err, txId: tx.txId }, 'Transaction failed');
//         return { success: false, txId: tx.txId, error: err.message };
//       }
//     })
//   );

//   const results = settled.map((r) => (r.status === 'fulfilled' ? r.value : { success: false, error: r.reason }));
//   const response = {
//     total: results.length,
//     success: results.filter((r) => r.success).length,
//     failed: results.filter((r) => !r.success).length,
//     details: results,
//   };

//   if (results.some((r) => r.code === 429)) response.rateLimit = true;

//   return response;
// };

// export const getAnalytics = async (fastify) => {
//   const txs = await fastify.prisma.transaction.findMany();

//   const volumeBySource = {};
//   const destTotals = {};
//   const txPerHour = {};

//   for (const tx of txs) {
//     volumeBySource[tx.source] = (volumeBySource[tx.source] || 0) + tx.amount;

//     if (!destTotals[tx.destination]) destTotals[tx.destination] = { total: 0, count: 0 };
//     destTotals[tx.destination].total += tx.amount;
//     destTotals[tx.destination].count++;

//     const hour = new Date(tx.timestamp).getUTCHours();
//     txPerHour[hour] = (txPerHour[hour] || 0) + 1;
//   }

//   const avgAmountByDest = {};
//   for (const [dest, data] of Object.entries(destTotals)) {
//     avgAmountByDest[dest] = data.total / data.count;
//   }

//   return { volumeBySource, avgAmountByDest, txPerHour };
// };
export const processTransactions = async (fastify, transactionsInput) => {
  const txs = Array.isArray(transactionsInput) ? transactionsInput : [transactionsInput];

  return txs.map(tx => ({
    success: true,
    tx,
    fraudReasons: []
  }));
};

export const getAnalytics = async (fastify) => {
  const txs = await fastify.prisma.transaction.findMany();

  const volumeBySource = {};
  const avgAmountByDest = {};
  const txPerHour = {};

  txs.forEach(tx => {
    volumeBySource[tx.source] = (volumeBySource[tx.source] || 0) + tx.amount;

    if (!avgAmountByDest[tx.destination]) avgAmountByDest[tx.destination] = 0;
    avgAmountByDest[tx.destination] += tx.amount;

    const hour = new Date(tx.createdAt).getUTCHours();
    txPerHour[hour] = (txPerHour[hour] || 0) + 1;
  });

  return { volumeBySource, avgAmountByDest, txPerHour };
};
