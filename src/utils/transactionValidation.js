import Joi from 'joi';

export const transactionSchema = Joi.object({
    txId: Joi.string().required(),
    amount: Joi.number().required(),
    currency: Joi.string().length(3).uppercase().required(),
    source: Joi.string().required(),
    destination: Joi.string().required(),
    timestamp: Joi.date().iso().required(),
});

export const transactionInputSchema = Joi.alternatives().try(
    transactionSchema,
    Joi.array().items(transactionSchema)
)
