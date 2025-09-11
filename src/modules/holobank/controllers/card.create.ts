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
    const { accountId, type, limit } = req.body
    const authenticatedUser = (req as any).user
    
    if (!authenticatedUser) {
      return (res as any).unauthorized({ 
        error: 'User authentication required' 
      })
    }
    
    if (!accountId || !type || !limit) {
      return (res as any).badRequest({ 
        error: 'Account ID, card type, and limit are required' 
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

    // Check if account exists
    const accountExists = user.bankDetails.accounts.find(
      account => account.accountId === accountId
    )

    if (!accountExists) {
      return (res as any).badRequest({ 
        error: 'Account not found for this user' 
      })
    }

    // Only REAP and JDB accounts can have cards
    if (!['REAP', 'JDB'].includes(accountExists.type)) {
      return (res as any).badRequest({ 
        error: 'Cards can only be created for REAP and JDB accounts' 
      })
    }

    // Create card with Holobank using productId 9
    const cardResponse = await holobankService.createCard({
      userId,
      accountId,
      type,
      limit,
      productId: 9
    }, user.bankDetails.userReferenceId)

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