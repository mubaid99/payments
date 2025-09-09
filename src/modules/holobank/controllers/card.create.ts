import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import '@core/declarations'

/**
 * Create card for an account
 * POST /holobank/card
 */
export const createCard = async (req: Request, res: Response) => {
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