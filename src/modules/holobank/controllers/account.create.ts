import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import '@core/declarations'

/**
 * Create account for user
 * POST /holobank/account
 */
export const createAccount = async (req: Request, res: Response) => {
  try {
    const { type, currency } = req.body
    const authenticatedUser = (req as any).user
    
    if (!authenticatedUser) {
      return (res as any).unauthorized({ 
        error: 'User authentication required' 
      })
    }
    
    if (!type || !currency) {
      return (res as any).badRequest({ 
        error: 'Account type and currency are required' 
      })
    }
    
    const userId = authenticatedUser._id.toString()
    const user = await User.findById(userId)
    if (!user) {
      return (res as any).notFound({ 
        error: 'User not found' 
      })
    }

    if (!user.bankDetails?.userReferenceId) {
      return (res as any).badRequest({ 
        error: 'Core user must be created first' 
      })
    }

    if (user.bankDetails.kycStatus !== 'approved') {
      return (res as any).badRequest({ 
        error: 'KYC must be approved before creating an account' 
      })
    }

    // Validate account type (only REAP and JDB can be created, PLATFORM is auto-created)
    if (!['REAP', 'JDB'].includes(type)) {
      return (res as any).badRequest({ 
        error: 'Only REAP (crypto) and JDB (fiat) accounts can be created manually' 
      })
    }

    // Create account with Holobank API
    const accountResponse = await holobankService.createAccount({
      userId,
      type,
      currency
    }, user.bankDetails.userReferenceId)

    if (!accountResponse.success) {
      return (res as any).badRequest({ 
        error: 'Failed to create account' 
      })
    }

    // Add account to user's bank details
    user.bankDetails.accounts.push({
      accountId: accountResponse.accountId,
      type: accountResponse.type,
      currency: accountResponse.currency,
      balance: accountResponse.balance || 0
    })

    await user.save()

    return (res as any).success({
      data: {
        accountId: accountResponse.accountId,
        type: accountResponse.type,
        currency: accountResponse.currency,
        balance: accountResponse.balance,
        message: 'Account created successfully'
      }
    })

  } catch (error) {
    Logger.error('Create Account Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}