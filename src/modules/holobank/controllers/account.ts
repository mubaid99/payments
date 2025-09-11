import { Request, Response } from 'express'
import joi from 'joi'
import { responseHandler } from '@core/response'
import { User } from '@models/user'
import holobankService from '../services'
import Logger from '@core/Logger'

// Validation schemas
const createAccountSchema = joi.object({
  userId: joi.string().required(),
  type: joi.string().valid('checking', 'savings', 'business').required(),
  currency: joi.string().valid('USD', 'EUR', 'GBP').required()
})

const getAccountsSchema = joi.object({
  userId: joi.string().required()
})

export const createAccount = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const { error, value } = createAccountSchema.validate(req.body)
    if (error) {
      return responseHandler.badRequest(res, {
        error: error.details[0].message
      })
    }

    const { userId, type, currency } = value

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return responseHandler.badRequest(res, {
        error: 'User not found'
      })
    }

    // Check KYC status
    if (user.bankDetails?.kycStatus !== 'approved') {
      return responseHandler.badRequest(res, {
        error: 'KYC must be approved before creating account'
      })
    }

    // Create account via Holobank API
    const accountResponse = await holobankService.createAccount({
      userId: userId,
      type: type as 'checking' | 'savings' | 'business',
      currency: currency as 'USD' | 'EUR' | 'GBP'
    })

    if (!accountResponse.success) {
      return responseHandler.badRequest(res, {
        error: accountResponse.message || 'Account creation failed'
      })
    }

    // Update user's bank details in database
    if (!user.bankDetails) {
      user.bankDetails = {
        accounts: [],
        cards: [],
        kycStatus: 'approved'
      }
    }

    // Check if account already exists to avoid duplicates
    const existingAccount = user.bankDetails.accounts?.find(acc => acc.accountId === accountResponse.accountId)
    if (!existingAccount) {
      user.bankDetails.accounts?.push({
        accountId: accountResponse.accountId,
        type: accountResponse.type,
        currency: accountResponse.currency,
        balance: accountResponse.balance
      })
    }

    await user.save()

    Logger.info(`Account created successfully: ${accountResponse.accountId} for user: ${userId}`)

    return responseHandler.success(res, {
      message: 'Account created successfully',
      data: {
        accountId: accountResponse.accountId,
        type: accountResponse.type,
        currency: accountResponse.currency,
        balance: accountResponse.balance
      }
    })

  } catch (error) {
    Logger.error('Create account error:', error)
    return responseHandler.serverError(res, {
      error: 'Failed to create account'
    })
  }
}

export const getAccounts = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const { error, value } = getAccountsSchema.validate(req.query)
    if (error) {
      return responseHandler.badRequest(res, {
        error: error.details[0].message
      })
    }

    const { userId } = value

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return responseHandler.badRequest(res, {
        error: 'User not found'
      })
    }

    // Get accounts from Holobank API (to ensure we have latest data)
    const holobankAccounts = await holobankService.getAccounts(userId)

    // Sync with local database
    if (user.bankDetails && holobankAccounts.length > 0) {
      user.bankDetails.accounts = holobankAccounts.map(acc => ({
        accountId: acc.accountId,
        type: acc.type,
        currency: acc.currency,
        balance: acc.balance
      }))
      await user.save()
    }

    // Return local database accounts (which are now synced)
    const accounts = user.bankDetails?.accounts || []

    return responseHandler.success(res, {
      message: 'Accounts retrieved successfully',
      data: accounts
    })

  } catch (error) {
    Logger.error('Get accounts error:', error)
    return responseHandler.serverError(res, {
      error: 'Failed to retrieve accounts'
    })
  }
}