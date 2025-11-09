export function calculateAnalytics(transactions) {
  const volumeBySource = {};
  const avgAmountByDest = {};
  const txPerHour = {};

  transactions.forEach(tx => {
    volumeBySource[tx.source] = (volumeBySource[tx.source] || 0) + tx.amount;
    avgAmountByDest[tx.destination] = tx.amount; // simplified for single tx
    const hour = new Date(tx.createdAt).getUTCHours();
    txPerHour[hour] = (txPerHour[hour] || 0) + 1;
  });

  return { volumeBySource, avgAmountByDest, txPerHour };
}
