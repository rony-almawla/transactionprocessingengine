export const checkRateLimit = async (fastify, source) =>{
    const key = `rate_limit_${source}`;
    const limit = 100;
    const window = 5 * 60; // we have to trasform the minutes to seconds

    try{
        const count = await  fastify.redis.incr(key);
        if(count ===1){
            await fastify.redis.expire(key, window);
        }
            if(count > limit){
        return false; // if the limits exceeds return false
    } return true; // else return true
    
    } catch (err){
        if(!fastify.rateLimitMap) fastify.rateLimitMap = new Map();

        const now = Date.now();
        const resetTime = now + window * 1000;
        const current = fastify.rateLimitMap.get(source) || {count:0, resetTime};
        
        if (current.resetTime < now){
            current.count = 1;
            current.resetTime = resetTime;
        }else{
            current.count++;
        }
        fastify.rateLimitMap.set(source, current);

        return current.count <= limit;
    
    }
};
