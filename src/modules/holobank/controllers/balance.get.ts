import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import '@core/declarations'

/**
 * Get account balance
 * GET /holobank/balance/:accountId
 */
export const getBalance = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params
    const { userId } = req.query

    if (!accountId || !userId) {
      return (res as any).badRequest({ 
        error: 'Account ID and User ID are required' 
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return (res as any).notFound({ 
        error: 'User not found' 
      })
    }

    // Verify account belongs to user
    const userAccount = user.bankDetails?.accounts.find(
      account => account.accountId === accountId
    )

    if (!userAccount) {
      return (res as any).badRequest({ 
        error: 'Account not found for this user' 
      })
    }

    // Get latest balance from Holobank
    const balanceResponse = await holobankService.getBalance(accountId)

    if (!balanceResponse.success) {
      return (res as any).badRequest({ 
        error: 'Failed to fetch balance' 
      })
    }

    // Update local balance
    userAccount.balance = balanceResponse.balance
    await user.save()

    // Emit real-time balance update
    const io = global.io
    if (io) {
      io.to(userId as string).emit('holobank:balanceUpdate', {
        accountId: accountId,
        newBalance: balanceResponse.balance,
        currency: balanceResponse.currency
      })
    }

    return (res as any).success({
      data: {
        accountId: balanceResponse.accountId,
        balance: balanceResponse.balance,
        currency: balanceResponse.currency,
        lastUpdated: new Date()
      }
    })

  } catch (error) {
    Logger.error('Get Balance Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}