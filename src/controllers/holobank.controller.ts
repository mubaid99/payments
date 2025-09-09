import { Request, Response } from 'express'
import holobankService from '../services/holobank.service'
import { User } from '@models/user'
import '@core/declarations'

export class HolobankController {
  /**
   * Upload KYC documents for a user
   * POST /holobank/kyc
   */
  static async uploadKYC(req: Request, res: Response) {
    try {
      const { userId } = req.body
      const file = (req as any).files?.document

      if (!userId || !file) {
        return (res as any).badRequest({ 
          error: 'User ID and document file are required' 
        })
      }

      // Upload KYC to Holobank
      const kycResponse = await holobankService.uploadKYC(userId, file)

      if (!kycResponse.success) {
        return (res as any).badRequest({ 
          error: 'Failed to upload KYC documents' 
        })
      }

      // Update user with KYC status
      const user = await User.findById(userId)
      if (!user) {
        return (res as any).notFound({ 
          error: 'User not found' 
        })
      }

      // Initialize bankDetails if it doesn't exist
      if (!user.bankDetails) {
        user.bankDetails = {
          accounts: [],
          cards: [],
          kycStatus: 'pending'
        }
      }

      user.bankDetails.holobankUserId = kycResponse.kycId
      user.bankDetails.kycStatus = kycResponse.status

      await user.save()

      return (res as any).success({
        data: {
          kycId: kycResponse.kycId,
          status: kycResponse.status,
          message: 'KYC documents uploaded successfully'
        }
      })

    } catch (error) {
      Logger.error('KYC Upload Error:', error)
      return (res as any).internalServerError({ 
        error: error.message 
      })
    }
  }

  /**
   * Create account for user
   * POST /holobank/account
   */
  static async createAccount(req: Request, res: Response) {
    try {
      const { userId, type, currency } = req.body

      if (!userId || !type || !currency) {
        return (res as any).badRequest({ 
          error: 'User ID, account type, and currency are required' 
        })
      }

      const user = await User.findById(userId)
      if (!user) {
        return (res as any).notFound({ 
          error: 'User not found' 
        })
      }

      if (!user.bankDetails || user.bankDetails.kycStatus !== 'approved') {
        return (res as any).badRequest({ 
          error: 'KYC must be approved before creating an account' 
        })
      }

      // Create account with Holobank
      const accountResponse = await holobankService.createAccount(userId, type, currency)

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

  /**
   * Create card for an account
   * POST /holobank/card
   */
  static async createCard(req: Request, res: Response) {
    try {
      const { userId, accountId, type, limit } = req.body

      if (!userId || !accountId || !type || !limit) {
        return (res as any).badRequest({ 
          error: 'User ID, account ID, card type, and limit are required' 
        })
      }

      const user = await User.findById(userId)
      if (!user) {
        return (res as any).notFound({ 
          error: 'User not found' 
        })
      }

      // Check if account exists
      const accountExists = user.bankDetails?.accounts.find(
        account => account.accountId === accountId
      )

      if (!accountExists) {
        return (res as any).badRequest({ 
          error: 'Account not found for this user' 
        })
      }

      // Create card with Holobank
      const cardResponse = await holobankService.createCard(accountId, type, limit)

      if (!cardResponse.success) {
        return (res as any).badRequest({ 
          error: 'Failed to create card' 
        })
      }

      // Add card to user's bank details
      user.bankDetails!.cards.push({
        cardId: cardResponse.cardId,
        type: cardResponse.type,
        limit: cardResponse.limit,
        status: cardResponse.status
      })

      await user.save()

      return (res as any).success({
        data: {
          cardId: cardResponse.cardId,
          type: cardResponse.type,
          limit: cardResponse.limit,
          status: cardResponse.status,
          message: 'Card created successfully'
        }
      })

    } catch (error) {
      Logger.error('Create Card Error:', error)
      return (res as any).internalServerError({ 
        error: error.message 
      })
    }
  }

  /**
   * Transfer funds between accounts
   * POST /holobank/transfer
   */
  static async transfer(req: Request, res: Response) {
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

  /**
   * Get account balance
   * GET /holobank/balance/:accountId
   */
  static async getBalance(req: Request, res: Response) {
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
}

export default HolobankController