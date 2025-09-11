import { Request, Response } from 'express'
import joi from 'joi'
import { responseHandler } from '@core/response'
import { User } from '@models/user'
import { Transaction } from '@models/transaction'
import holobankService from '../services'
import Logger from '@core/Logger'
import { v4 as uuidv4 } from 'uuid'

// Validation schemas
const createTransferSchema = joi.object({
  userId: joi.string().required(),
  fromAccountId: joi.string().required(),
  toAccountId: joi.string().required(),
  amount: joi.number().positive().required(),
  currency: joi.string().valid('USD', 'EUR', 'GBP').required()
})

export const createTransfer = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const { error, value } = createTransferSchema.validate(req.body)
    if (error) {
      return responseHandler.badRequest(res, {
        error: error.details[0].message
      })
    }

    const { userId, fromAccountId, toAccountId, amount, currency } = value

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return responseHandler.badRequest(res, {
        error: 'User not found'
      })
    }

    // Check if from account belongs to user
    const fromAccount = user.bankDetails?.accounts?.find(acc => acc.accountId === fromAccountId)
    if (!fromAccount) {
      return responseHandler.badRequest(res, {
        error: 'Source account not found or does not belong to user'
      })
    }

    // Check if account has sufficient balance
    if (fromAccount.balance && fromAccount.balance < amount) {
      return responseHandler.badRequest(res, {
        error: 'Insufficient balance'
      })
    }

    // Check currency match
    if (fromAccount.currency !== currency) {
      return responseHandler.badRequest(res, {
        error: 'Currency mismatch with source account'
      })
    }

    // Create transaction record in our database first
    const transactionId = uuidv4()
    const transaction = new Transaction({
      userId: userId,
      transactionId: transactionId,
      type: 'transfer',
      amount: amount,
      currency: currency,
      fromAccountId: fromAccountId,
      toAccountId: toAccountId,
      status: 'pending',
      description: `Transfer from ${fromAccountId} to ${toAccountId}`,
      metadata: {
        transferType: 'internal',
        initiatedBy: userId
      }
    })

    await transaction.save()

    // Initiate transfer via Holobank API
    const transferResponse = await holobankService.transfer({
      userId: userId,
      fromAccountId: fromAccountId,
      toAccountId: toAccountId,
      amount: amount,
      currency: currency
    })

    if (!transferResponse.success) {
      // Update transaction status to failed
      transaction.status = 'failed'
      transaction.metadata = {
        ...transaction.metadata,
        error: transferResponse.message,
        failedAt: new Date()
      }
      await transaction.save()

      return responseHandler.badRequest(res, {
        error: transferResponse.message || 'Transfer failed'
      })
    }

    // Update transaction with Holobank transaction ID and mark as completed
    transaction.holobankTransactionId = transferResponse.transactionId
    transaction.status = 'completed'
    transaction.processedAt = new Date()
    transaction.metadata = {
      ...transaction.metadata,
      holobankResponse: transferResponse,
      completedAt: new Date()
    }
    await transaction.save()

    // Update account balances in our database
    if (fromAccount.balance !== undefined) {
      fromAccount.balance -= amount
    }

    // If destination account belongs to the same user, update it too
    const toAccount = user.bankDetails?.accounts?.find(acc => acc.accountId === toAccountId)
    if (toAccount && toAccount.balance !== undefined) {
      toAccount.balance += amount
    }

    await user.save()

    Logger.info(`Transfer completed successfully: ${transferResponse.transactionId} for user: ${userId}`)

    // Emit WebSocket event for real-time notification
    const io = req.app.get('socketio')
    if (io) {
      io.to(userId).emit('transfer_completed', {
        transactionId: transferResponse.transactionId,
        from: fromAccountId,
        to: toAccountId,
        amount: amount,
        currency: currency,
        status: 'completed',
        timestamp: new Date()
      })
    }

    return responseHandler.success(res, {
      message: 'Transfer completed successfully',
      data: {
        transactionId: transferResponse.transactionId,
        from: fromAccountId,
        to: toAccountId,
        amount: amount,
        currency: currency,
        status: transferResponse.status
      }
    })

  } catch (error) {
    Logger.error('Create transfer error:', error)
    return responseHandler.serverError(res, {
      error: 'Failed to process transfer'
    })
  }
}

export const getTransferHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query
    const { page = 1, limit = 10 } = req.query

    if (!userId) {
      return responseHandler.badRequest(res, {
        error: 'User ID is required'
      })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return responseHandler.badRequest(res, {
        error: 'User not found'
      })
    }

    // Get transaction history
    const transactions = await Transaction.find({ 
      userId: userId,
      type: 'transfer'
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit))

    const totalCount = await Transaction.countDocuments({
      userId: userId,
      type: 'transfer'
    })

    return responseHandler.success(res, {
      message: 'Transfer history retrieved successfully',
      data: {
        transactions: transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      }
    })

  } catch (error) {
    Logger.error('Get transfer history error:', error)
    return responseHandler.serverError(res, {
      error: 'Failed to retrieve transfer history'
    })
  }
}