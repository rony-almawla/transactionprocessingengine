import Joi from 'joi';

export const transactionSchema = Joi.object({
  txId: Joi.string().required(),
  amount: Joi.number().required(),
  currency: Joi.string().uppercase().required(),
  source: Joi.string().required(),
  destination: Joi.string().required(),
  timestamp: Joi.date().iso().required()
});

export const transactionArraySchema = Joi.array().items(transactionSchema);
