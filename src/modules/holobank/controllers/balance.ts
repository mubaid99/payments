import { Request, Response } from 'express'
import joi from 'joi'
import { responseHandler } from '@core/response'
import { User } from '@models/user'
import holobankService from '../services'
import Logger from '@core/Logger'

// Validation schemas
const getBalanceSchema = joi.object({
  accountId: joi.string().required(),
  userId: joi.string().required()
})

export const getBalance = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params
    const { userId } = req.query

    // Validate request data
    const { error, value } = getBalanceSchema.validate({ accountId, userId })
    if (error) {
      return responseHandler.badRequest(res, {
        error: error.details[0].message
      })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return responseHandler.badRequest(res, {
        error: 'User not found'
      })
    }

    // Check if account belongs to user
    const account = user.bankDetails?.accounts?.find(acc => acc.accountId === accountId)
    if (!account) {
      return responseHandler.badRequest(res, {
        error: 'Account not found or does not belong to user'
      })
    }

    // Get real-time balance from Holobank API
    const balanceResponse = await holobankService.getBalance(accountId, userId as string)

    if (!balanceResponse.success) {
      return responseHandler.badRequest(res, {
        error: balanceResponse.message || 'Failed to retrieve balance'
      })
    }

    // Update local database with latest balance
    account.balance = balanceResponse.balance
    await user.save()

    Logger.info(`Balance retrieved successfully for account: ${accountId} user: ${userId}`)

    // Emit WebSocket event for real-time balance update
    const io = req.app.get('socketio')
    if (io) {
      io.to(userId as string).emit('balance_updated', {
        accountId: accountId,
        balance: balanceResponse.balance,
        currency: balanceResponse.currency,
        lastUpdated: balanceResponse.lastUpdated
      })
    }

    return responseHandler.success(res, {
      message: 'Balance retrieved successfully',
      data: {
        accountId: accountId,
        balance: balanceResponse.balance,
        currency: balanceResponse.currency,
        lastUpdated: balanceResponse.lastUpdated
      }
    })

  } catch (error) {
    Logger.error('Get balance error:', error)
    return responseHandler.serverError(res, {
      error: 'Failed to retrieve balance'
    })
  }
}

export const getAllBalances = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query

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

    const accounts = user.bankDetails?.accounts || []
    const balances = []

    // Get balance for each account
    for (const account of accounts) {
      try {
        const balanceResponse = await holobankService.getBalance(account.accountId, userId as string)
        
        if (balanceResponse.success) {
          // Update local database
          account.balance = balanceResponse.balance
          
          balances.push({
            accountId: account.accountId,
            type: account.type,
            balance: balanceResponse.balance,
            currency: balanceResponse.currency,
            lastUpdated: balanceResponse.lastUpdated
          })
        }
      } catch (error) {
        Logger.error(`Failed to get balance for account ${account.accountId}:`, error)
        // Include account with last known balance if API fails
        balances.push({
          accountId: account.accountId,
          type: account.type,
          balance: account.balance || 0,
          currency: account.currency,
          lastUpdated: new Date(),
          error: 'Failed to fetch real-time balance'
        })
      }
    }

    // Save updated balances
    await user.save()

    return responseHandler.success(res, {
      message: 'All balances retrieved successfully',
      data: {
        userId: userId,
        accounts: balances,
        totalAccounts: balances.length
      }
    })

  } catch (error) {
    Logger.error('Get all balances error:', error)
    return responseHandler.serverError(res, {
      error: 'Failed to retrieve balances'
    })
  }
}