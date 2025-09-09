import constant from '@core/constants'
import Joi from 'joi'


export const createAlertValidator = Joi.object({
  walletAddress: Joi.string().required(),
  token: Joi.object({
    name: Joi.string().required(),
    symbol: Joi.string().required(),
  }),
  type: Joi.string().required().valid(...Object.values(constant.alert.types)),
  price: Joi.string().optional(),
  change: Joi.string().optional(),
  frequency: Joi.string().required().valid(...Object.values(constant.alert.frequency)),
})

export const listAlertsValidator = Joi.object({
  walletAddress: Joi.string().required()
})

export const cancelAlertsValidator = Joi.object({
  walletAddress: Joi.string().required(),
  alerts: Joi.array().required()
})