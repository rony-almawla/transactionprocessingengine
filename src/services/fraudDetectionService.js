const HIGH_RISK_COUNTRIES = ["CI", "SO", "VE"];
const HIGH_AMOUNT = 5000;

export async function checkFraud(fastify, tx) {
  const reasons = [];

  if (tx.amount > HIGH_AMOUNT) reasons.push("High amount");
  if (HIGH_RISK_COUNTRIES.includes(tx.destination)) reasons.push("High-risk destination");

  // Last 10 min transaction count
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await fastify.prisma.transaction.count({
    where: { source: tx.source, timestamp: { gte: tenMinutesAgo } } // ← use timestamp
  });
  if (recentCount >= 5) reasons.push("Too many transactions in 10 minutes");

  return { isFraud: reasons.length > 0, reasons };
}
