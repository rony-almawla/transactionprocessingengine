export const isHighAmount = (tx) => {
    return Number(tx.amount)>5000;
};

const High_RISK = new Set(['NG', 'PK', 'UA', 'RU', 'CN']);

export const isHighRiskDest = (tx) =>{
    return High_RISK.has(String(tx.destination).toUpperCase()); 

};

export const isRapidTransactions = async (fastify, tx)=> {
    const tenMinutesAgo = new Date(Date.now()-10*60*1000);
    const count = await fastify.prisma.transaction.count({
        where: {
            source: tx.source,
            timestamp: {
                gte: tenMinutesAgo
            }
        }
    });
    return count >= 5;
};

export const checkAllRules = async (fastify, tx) => {
        const reasons = [];
    if(isHighAmount(tx)) reasons.push('High Amount');
    if(isHighRiskDest(tx)) reasons.push('High Risk Destination Country');
    if(await isRapidTransactions(fastify, tx)) reasons.push('Rapid Transactions from the source in 10 minutes');
    return reasons;
};