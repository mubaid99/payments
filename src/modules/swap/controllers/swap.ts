import '@core/declarations'
import { Request, Response } from 'express'
import swapService from '../services'
import { SwapRequestDto, SwapHistoryRequestDto, SwapStatusRequestDto } from '../dto'
import Joi from 'joi'

/**
 * Validation schema for swap creation
 */
const swapValidationSchema = Joi.object({
  fromToken: Joi.string().required().description('Source token in format BLOCKCHAIN.SYMBOL or BLOCKCHAIN--ADDRESS'),
  toToken: Joi.string().required().description('Destination token in format BLOCKCHAIN.SYMBOL or BLOCKCHAIN--ADDRESS'),
  amount: Joi.string().required().description('Amount to swap in wei/smallest unit'),
  slippage: Joi.number().min(0).max(50).default(3).description('Slippage tolerance percentage'),
  userWalletAddress: Joi.string().required().description('User wallet address')
})

/**
 * Validation schema for swap history
 */
const historyValidationSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'FAILED', 'SUCCESS').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  fromDate: Joi.string().isoDate().optional(),
  toDate: Joi.string().isoDate().optional()
})

/**
 * @route POST /api/v1/swap/create
 * @desc Create a new swap transaction
 * @access Private (requires authentication)
 */
export const createSwap = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = swapValidationSchema.validate(req.body)
    
    if (error) {
      ;(res as any).badRequest({
        error: error.details[0].message,
        message: 'Invalid request parameters'
      })
      return
    }

    // Get user ID from authenticated request
    const userId = (req as any).user?.id || (req as any).user?._id
    
    if (!userId) {
      ;(res as any).unauthorized({
        error: 'User authentication required',
        message: 'Please login to create swap transactions'
      })
      return
    }

    const request: SwapRequestDto = {
      userId: userId.toString(),
      fromToken: value.fromToken,
      toToken: value.toToken,
      amount: value.amount,
      slippage: value.slippage,
      userWalletAddress: value.userWalletAddress
    }

    const result = await swapService.createSwapTransaction(request)

    if (result.success) {
      ;(res as any).created({
        transactionId: result.transactionId,
        swapId: result.swapId,
        txData: result.txData,
        message: result.message || 'Swap transaction created successfully'
      })
    } else {
      ;(res as any).badRequest({
        error: result.error,
        message: 'Failed to create swap transaction'
      })
    }
  } catch (error) {
    Logger.error('Error in createSwap controller:', error)
    ;(res as any).internalServerError({
      error: 'Internal server error while creating swap transaction'
    })
  }
}

/**
 * @route GET /api/v1/swap/history
 * @desc Get swap transaction history for authenticated user
 * @access Private (requires authentication)
 */
export const getSwapHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const { error, value } = historyValidationSchema.validate(req.query)
    
    if (error) {
      ;(res as any).badRequest({
        error: error.details[0].message,
        message: 'Invalid query parameters'
      })
      return
    }

    // Get user ID from authenticated request
    const userId = (req as any).user?.id || (req as any).user?._id
    
    if (!userId) {
      ;(res as any).unauthorized({
        error: 'User authentication required',
        message: 'Please login to view swap history'
      })
      return
    }

    const request: SwapHistoryRequestDto = {
      userId: userId.toString(),
      status: value.status,
      page: value.page,
      limit: value.limit,
      fromDate: value.fromDate,
      toDate: value.toDate
    }

    const result = await swapService.getSwapHistory(request)

    if (result.success) {
      ;(res as any).success({
        swaps: result.swaps,
        pagination: result.pagination,
        message: 'Swap history retrieved successfully'
      })
    } else {
      ;(res as any).badRequest({
        error: result.error,
        message: 'Failed to retrieve swap history'
      })
    }
  } catch (error) {
    Logger.error('Error in getSwapHistory controller:', error)
    ;(res as any).internalServerError({
      error: 'Internal server error while retrieving swap history'
    })
  }
}

/**
 * @route GET /api/v1/swap/status/:transactionId
 * @desc Get status of a specific swap transaction
 * @access Private (requires authentication)
 */
export const getSwapStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params

    if (!transactionId) {
      ;(res as any).badRequest({
        error: 'Transaction ID is required',
        message: 'Please provide a valid transaction ID'
      })
      return
    }

    // Get user ID from authenticated request
    const userId = (req as any).user?.id || (req as any).user?._id
    
    if (!userId) {
      ;(res as any).unauthorized({
        error: 'User authentication required',
        message: 'Please login to view swap status'
      })
      return
    }

    const request: SwapStatusRequestDto = {
      transactionId: transactionId,
      userId: userId.toString()
    }

    const result = await swapService.getSwapStatus(request)

    if (result.success) {
      ;(res as any).success({
        status: result.status,
        transaction: result.transaction,
        message: 'Swap status retrieved successfully'
      })
    } else {
      ;(res as any).badRequest({
        error: result.error,
        message: 'Failed to retrieve swap status'
      })
    }
  } catch (error) {
    Logger.error('Error in getSwapStatus controller:', error)
    ;(res as any).internalServerError({
      error: 'Internal server error while retrieving swap status'
    })
  }
}