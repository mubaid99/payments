import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import { Transaction } from '@models/transaction'
import { v4 as uuidv4 } from 'uuid'
import '@core/declarations'

/**
 * Transfer funds between accounts
 * POST /holobank/transfer
 */
export const createTransfer = async (req: Request, res: Response) => {
  try {
    const { fromAccountId, toAccountId, amount, currency } = req.body
    const authenticatedUser = (req as any).user
    
    if (!authenticatedUser) {
      return (res as any).unauthorized({ 
        error: 'User authentication required' 
      })
    }
    
    if (!fromAccountId || !toAccountId || !amount || !currency) {
      return (res as any).badRequest({ 
        error: 'All transfer details are required' 
      })
    }
    
    const userId = authenticatedUser._id.toString()
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

    // Create transaction record first
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
        transferType: 'holobank',
        initiatedBy: userId
      }
    })

    await transaction.save()

    // Process transfer with Holobank using new API structure
    const transferResponse = await holobankService.transfer({
      userId,
      fromAccountId,
      toAccountId,
      amount,
      currency
    }, user.bankDetails.userReferenceId)

    if (!transferResponse.success) {
      // Update transaction status to failed
      transaction.status = 'failed'
      transaction.metadata = {
        ...transaction.metadata,
        error: transferResponse.message,
        failedAt: new Date()
      }
      await transaction.save()
      
      return (res as any).badRequest({ 
        error: transferResponse.message || 'Transfer failed' 
      })
    }

    // Update transaction with success
    transaction.holobankTransactionId = transferResponse.transactionId
    transaction.status = 'completed'
    transaction.processedAt = new Date()
    transaction.metadata = {
      ...transaction.metadata,
      holobankResponse: transferResponse,
      completedAt: new Date()
    }
    await transaction.save()

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