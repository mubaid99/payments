// src/dto/qrPayment.dto.ts
import Joi from 'joi'


export const createQRPaymentValidator = Joi.object({
  blockchain: Joi.string().valid('ethereum', 'bsc','sepolia', 'polygon', 'tron').required(),
  coinName: Joi.string().required(),
  clientId: Joi.string().required(),
  toAddress: Joi.string().required(),
  amount: Joi.alternatives().try(Joi.number(), Joi.string()).optional(), // accept "25.5" or 25.5
  contract: Joi.string().optional(), // ERC20 / TRC20 contract address
})
