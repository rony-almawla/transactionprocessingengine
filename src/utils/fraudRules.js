const HIGH_RISK = new Set(['CI', 'SO', 'VE']);

// to check if amount > 5000
export const isHighAmount = (tx) => {
  const amount = Number(tx.amount);
  return !isNaN(amount) && amount > 5000;
};

// to check if destination is high-risk
export const isHighRiskDest = (tx) => {
  const dest = String(tx.destination || '').toUpperCase();
  return HIGH_RISK.has(dest);
};

// to check for rapid transactions from same source
export const isRapidTransactions = async (fastify, tx) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const count = await fastify.prisma.transaction.count({
    where: {
      source: tx.source,
      timestamp: { gte: tenMinutesAgo },
    },
  });
  return count > 5;
};

// to check all rules and return reasons list
export const checkAllRules = async (fastify, tx) => {
  const rules = [
    { fn: isHighAmount, reason: 'High Amount' },
    { fn: isHighRiskDest, reason: 'High Risk Destination' },
    { fn: async (t) => await isRapidTransactions(fastify, t), reason: 'Rapid Transactions from the source in 10 minutes' },
  ];

  const reasons = [];
  for (const r of rules) {
    try {
      const matched = await Promise.resolve(r.fn(tx));
      if (matched) reasons.push(r.reason);
    } catch (err) {
      fastify.log.error({ err, txId: tx.txId }, 'Error evaluating fraud rule');
    }
  }
  return reasons;
};
