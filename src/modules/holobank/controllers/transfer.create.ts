import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import '@core/declarations'

/**
 * Transfer funds between accounts
 * POST /holobank/transfer
 */
export const createTransfer = async (req: Request, res: Response) => {
  try {
    const { userId, fromAccountId, toAccountId, amount, currency } = req.body

    if (!userId || !fromAccountId || !toAccountId || !amount || !currency) {
      return (res as any).badRequest({ 
        error: 'All transfer details are required' 
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return (res as any).notFound({ 
        error: 'User not found' 
      })
    }

    // Verify sender account belongs to user
    const senderAccount = user.bankDetails?.accounts.find(
      account => account.accountId === fromAccountId
    )

    if (!senderAccount) {
      return (res as any).badRequest({ 
        error: 'Sender account not found' 
      })
    }

    // Check sufficient balance
    if (senderAccount.balance && senderAccount.balance < amount) {
      return (res as any).badRequest({ 
        error: 'Insufficient balance' 
      })
    }

    // Process transfer with Holobank
    const transferResponse = await holobankService.transfer(
      fromAccountId, 
      toAccountId, 
      amount, 
      currency
    )

    if (!transferResponse.success) {
      return (res as any).badRequest({ 
        error: 'Transfer failed' 
      })
    }

    // Update sender balance
    senderAccount.balance = (senderAccount.balance || 0) - amount
    await user.save()

    // Emit real-time notification via WebSocket
    const io = global.io
    if (io) {
      io.to(userId).emit('holobank:transactions', {
        type: 'debit',
        accountId: fromAccountId,
        amount: amount,
        currency: currency,
        transactionId: transferResponse.transactionId,
        timestamp: new Date()
      })

      // Also emit balance update
      io.to(userId).emit('holobank:balanceUpdate', {
        accountId: fromAccountId,
        newBalance: senderAccount.balance,
        currency: currency
      })
    }

    return (res as any).success({
      data: {
        transactionId: transferResponse.transactionId,
        from: transferResponse.from,
        to: transferResponse.to,
        amount: transferResponse.amount,
        currency: transferResponse.currency,
        status: transferResponse.status,
        message: 'Transfer completed successfully'
      }
    })

  } catch (error) {
    Logger.error('Transfer Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}