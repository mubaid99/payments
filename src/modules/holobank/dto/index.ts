import Joi from 'joi'

export const uploadKYCValidator = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required'
  })
})

export const createAccountValidator = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required'
  }),
  type: Joi.string().required().valid('checking', 'savings', 'business').messages({
    'string.empty': 'Account type is required',
    'any.required': 'Account type is required',
    'any.only': 'Account type must be one of: checking, savings, business'
  }),
  currency: Joi.string().required().valid('USD', 'EUR', 'GBP').messages({
    'string.empty': 'Currency is required',
    'any.required': 'Currency is required',
    'any.only': 'Currency must be one of: USD, EUR, GBP'
  })
})

export const createCardValidator = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required'
  }),
  accountId: Joi.string().required().messages({
    'string.empty': 'Account ID is required',
    'any.required': 'Account ID is required'
  }),
  type: Joi.string().required().valid('debit', 'credit', 'prepaid').messages({
    'string.empty': 'Card type is required',
    'any.required': 'Card type is required',
    'any.only': 'Card type must be one of: debit, credit, prepaid'
  }),
  limit: Joi.number().positive().required().messages({
    'number.positive': 'Limit must be a positive number',
    'any.required': 'Limit is required'
  })
})

export const createTransferValidator = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required'
  }),
  fromAccountId: Joi.string().required().messages({
    'string.empty': 'From account ID is required',
    'any.required': 'From account ID is required'
  }),
  toAccountId: Joi.string().required().messages({
    'string.empty': 'To account ID is required',
    'any.required': 'To account ID is required'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().required().valid('USD', 'EUR', 'GBP').messages({
    'string.empty': 'Currency is required',
    'any.required': 'Currency is required',
    'any.only': 'Currency must be one of: USD, EUR, GBP'
  })
})

export const getBalanceValidator = Joi.object({
  accountId: Joi.string().required().messages({
    'string.empty': 'Account ID is required',
    'any.required': 'Account ID is required'
  }),
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required', 
    'any.required': 'User ID is required'
  })
})