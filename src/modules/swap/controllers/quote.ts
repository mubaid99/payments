import '@core/declarations'
import { Request, Response } from 'express'
import swapService from '../services'
import { QuoteRequestDto } from '../dto'
import Joi from 'joi'

/**
 * Validation schema for quote request
 */
const quoteValidationSchema = Joi.object({
  from: Joi.string().required().description('Source token in format BLOCKCHAIN.SYMBOL or BLOCKCHAIN--ADDRESS'),
  to: Joi.string().required().description('Destination token in format BLOCKCHAIN.SYMBOL or BLOCKCHAIN--ADDRESS'),
  amount: Joi.string().required().description('Amount to swap in wei/smallest unit'),
  slippage: Joi.string().default('3').description('Slippage tolerance percentage'),
  apiKey: Joi.string().optional().description('Rango API key (optional)')
})

/**
 * @route GET /api/v1/swap/quote
 * @desc Get quote for token swap
 * @access Public
 */
export const getQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request parameters
    const { error, value } = quoteValidationSchema.validate(req.query)
    
    if (error) {
      ;(res as any).badRequest({
        error: error.details[0].message,
        message: 'Invalid request parameters'
      })
      return
    }

    const request: QuoteRequestDto = {
      from: value.from,
      to: value.to,
      amount: value.amount,
      slippage: value.slippage,
      apiKey: value.apiKey
    }

    const result = await swapService.getQuote(request)

    if (result.success) {
      ;(res as any).success({
        quote: result.quote,
        diagnosisMessages: result.diagnosisMessages,
        message: 'Quote retrieved successfully'
      })
    } else {
      ;(res as any).badRequest({
        error: result.error,
        diagnosisMessages: result.diagnosisMessages,
        message: 'Failed to get swap quote'
      })
    }
  } catch (error) {
    Logger.error('Error in getQuote controller:', error)
    ;(res as any).internalServerError({
      error: 'Internal server error while getting swap quote'
    })
  }
}