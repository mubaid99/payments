import { Request, Response } from 'express'
import crypto from 'crypto'
import { User } from '@models/user'
import { Transaction } from '@models/transaction'
import '@core/declarations'

/**
 * Verify webhook signature using HMAC-SHA256
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    // Remove 'sha256=' prefix if present
    const receivedSignature = signature.startsWith('sha256=') 
      ? signature.slice(7) 
      : signature

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')

    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    Logger.error('Signature verification error:', error)
    return false
  }
}

/**
 * Handle Holobank webhook notifications
 * POST /holobank/webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // Get signature from headers (common header names)
    const signature = req.headers['x-holobank-signature'] || 
                     req.headers['x-signature'] ||
                     req.headers['x-signature-sha256'] ||
                     req.headers['holobank-signature']

    if (!signature) {
      Logger.warn('Missing webhook signature')
      return res.status(400).json({ error: 'Missing signature header' })
    }

    // Get raw payload
    const rawPayload = JSON.stringify(req.body)
    const webhookSecret = process.env.HOLOBANK_WEBHOOK_SECRET

    if (!webhookSecret) {
      Logger.error('Webhook secret not configured')
      return res.status(500).json({ error: 'Webhook secret not configured' })
    }

    // Verify signature
    if (!verifyWebhookSignature(rawPayload, signature as string, webhookSecret)) {
      Logger.warn('Invalid webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const webhookData = req.body
    const { event_type, data, reference_id } = webhookData

    Logger.info(`Received Holobank webhook: ${event_type}`, { reference_id })

    // Handle different webhook events
    switch (event_type) {
      case 'kyc.status_updated':
        await handleKYCStatusUpdate(data, reference_id)
        break
      
      case 'transaction.created':
      case 'transaction.completed':
      case 'transaction.failed':
        await handleTransactionUpdate(data, reference_id)
        break
        
      case 'account.balance_updated':
        await handleBalanceUpdate(data, reference_id)
        break
        
      case 'card.status_updated':
        await handleCardStatusUpdate(data, reference_id)
        break
        
      default:
        Logger.warn(`Unknown webhook event type: ${event_type}`)
        break
    }

    // Send success response
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      event_type 
    })

  } catch (error) {
    Logger.error('Webhook processing error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

/**
 * Handle KYC status updates
 */
async function handleKYCStatusUpdate(data: any, referenceId: string) {
  try {
    const user = await User.findById(referenceId)
    if (!user) {
      Logger.error(`User not found for KYC update: ${referenceId}`)
      return
    }

    // Initialize bankDetails if not exists
    if (!user.bankDetails) {
      user.bankDetails = {
        accounts: [],
        cards: [],
        kycStatus: 'pending'
      }
    }

    // Update KYC status
    user.bankDetails.kycStatus = data.status
    user.bankDetails.holobankUserId = data.kyc_id || data.user_id

    await user.save()

    // Emit real-time notification
    const io = global.io
    if (io) {
      io.to(referenceId).emit('holobank:kyc_status_update', {
        status: data.status,
        kycId: data.kyc_id,
        timestamp: new Date()
      })
    }

    Logger.info(`KYC status updated for user ${referenceId}: ${data.status}`)
  } catch (error) {
    Logger.error('Error handling KYC status update:', error)
  }
}

/**
 * Handle transaction updates
 */
async function handleTransactionUpdate(data: any, referenceId: string) {
  try {
    const user = await User.findById(referenceId)
    if (!user) {
      Logger.error(`User not found for transaction update: ${referenceId}`)
      return
    }

    // Check if transaction already exists
    let transaction = await Transaction.findOne({
      holobankTransactionId: data.transaction_id
    })

    if (!transaction) {
      // Create new transaction record
      transaction = new Transaction({
        userId: referenceId,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        holobankTransactionId: data.transaction_id,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        fromAccountId: data.from_account_id,
        toAccountId: data.to_account_id,
        status: data.status,
        description: data.description,
        metadata: data.metadata,
        webhookData: data,
        processedAt: new Date()
      })
    } else {
      // Update existing transaction
      transaction.status = data.status
      transaction.metadata = data.metadata
      transaction.webhookData = data
      transaction.processedAt = new Date()
    }

    await transaction.save()

    // Update user account balance if transaction is completed
    if (data.status === 'completed' && user.bankDetails) {
      const account = user.bankDetails.accounts.find(
        acc => acc.accountId === data.from_account_id || acc.accountId === data.to_account_id
      )
      
      if (account && data.new_balance !== undefined) {
        account.balance = data.new_balance
        await user.save()
      }
    }

    // Emit real-time notification
    const io = global.io
    if (io) {
      io.to(referenceId).emit('holobank:transaction_update', {
        transactionId: transaction.transactionId,
        holobankTransactionId: data.transaction_id,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        timestamp: new Date()
      })
    }

    Logger.info(`Transaction updated for user ${referenceId}: ${data.transaction_id} - ${data.status}`)
  } catch (error) {
    Logger.error('Error handling transaction update:', error)
  }
}

/**
 * Handle balance updates
 */
async function handleBalanceUpdate(data: any, referenceId: string) {
  try {
    const user = await User.findById(referenceId)
    if (!user || !user.bankDetails) {
      Logger.error(`User or bank details not found for balance update: ${referenceId}`)
      return
    }

    // Update account balance
    const account = user.bankDetails.accounts.find(
      acc => acc.accountId === data.account_id
    )

    if (account) {
      account.balance = data.new_balance
      await user.save()

      // Emit real-time notification
      const io = global.io
      if (io) {
        io.to(referenceId).emit('holobank:balance_update', {
          accountId: data.account_id,
          newBalance: data.new_balance,
          currency: data.currency,
          timestamp: new Date()
        })
      }

      Logger.info(`Balance updated for user ${referenceId}, account ${data.account_id}: ${data.new_balance}`)
    }
  } catch (error) {
    Logger.error('Error handling balance update:', error)
  }
}

/**
 * Handle card status updates
 */
async function handleCardStatusUpdate(data: any, referenceId: string) {
  try {
    const user = await User.findById(referenceId)
    if (!user || !user.bankDetails) {
      Logger.error(`User or bank details not found for card update: ${referenceId}`)
      return
    }

    // Update card status
    const card = user.bankDetails.cards.find(
      c => c.cardId === data.card_id
    )

    if (card) {
      card.status = data.status
      await user.save()

      // Emit real-time notification
      const io = global.io
      if (io) {
        io.to(referenceId).emit('holobank:card_status_update', {
          cardId: data.card_id,
          status: data.status,
          timestamp: new Date()
        })
      }

      Logger.info(`Card status updated for user ${referenceId}, card ${data.card_id}: ${data.status}`)
    }
  } catch (error) {
    Logger.error('Error handling card status update:', error)
  }
}