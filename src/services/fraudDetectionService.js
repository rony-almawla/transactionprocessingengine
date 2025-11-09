export function checkFraud(transaction) {
  return { isFraud: transaction.amount > 10000 };
}
