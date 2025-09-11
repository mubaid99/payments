import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import '@core/declarations'

/**
 * Get deposit info for external transfers (e.g., MetaMask to PLATFORM)
 * GET /holobank/deposit/:accountId
 */
export const getDepositInfo = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params
    const authenticatedUser = (req as any).user
    
    if (!authenticatedUser) {
      return (res as any).unauthorized({ 
        error: 'User authentication required' 
      })
    }
    
    if (!accountId) {
      return (res as any).badRequest({ 
        error: 'Account ID is required' 
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

    // Verify account belongs to user
    const userAccount = user.bankDetails.accounts.find(
      account => account.accountId === accountId
    )

    if (!userAccount) {
      return (res as any).badRequest({ 
        error: 'Account not found for this user' 
      })
    }

    // Only PLATFORM accounts can receive external deposits
    if (userAccount.type !== 'PLATFORM') {
      return (res as any).badRequest({ 
        error: 'Deposit info only available for PLATFORM accounts' 
      })
    }

    // Get deposit info from Holobank
    const depositResponse = await holobankService.getDepositInfo(
      accountId, 
      user.bankDetails.userReferenceId
    )

    if (!depositResponse.success) {
      return (res as any).badRequest({ 
        error: depositResponse.message || 'Failed to get deposit info' 
      })
    }

    return (res as any).success({
      data: {
        accountId: accountId,
        walletAddress: depositResponse.walletAddress,
        currency: depositResponse.currency,
        network: depositResponse.network,
        message: 'Deposit info retrieved successfully'
      }
    })

  } catch (error) {
    Logger.error('Get Deposit Info Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}