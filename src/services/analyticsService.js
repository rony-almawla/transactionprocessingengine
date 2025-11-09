export function calculateAnalytics(transactions) {
  const volumeBySource = {};
  const destTotals = {};
  const txPerHour = {};

  for (const tx of transactions) {
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
}
