import { Request, Response } from 'express'
import joi from 'joi'
import { responseHandler } from '@core/response'
import { User } from '@models/user'
import holobankService from '../services'
import Logger from '@core/Logger'

// Validation schemas
const createCardSchema = joi.object({
  userId: joi.string().required(),
  accountId: joi.string().required(),
  type: joi.string().valid('debit', 'credit', 'prepaid').required(),
  limit: joi.number().positive().required()
})

const getCardsSchema = joi.object({
  userId: joi.string().required()
})

export const createCard = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const { error, value } = createCardSchema.validate(req.body)
    if (error) {
      return responseHandler.badRequest(res, {
        error: error.details[0].message
      })
    }

    const { userId, accountId, type, limit } = value

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return responseHandler.badRequest(res, {
        error: 'User not found'
      })
    }

    // Check if account exists in user's accounts
    const accountExists = user.bankDetails?.accounts?.find(acc => acc.accountId === accountId)
    if (!accountExists) {
      return responseHandler.badRequest(res, {
        error: 'Account not found or does not belong to user'
      })
    }

    // Check KYC status
    if (user.bankDetails?.kycStatus !== 'approved') {
      return responseHandler.badRequest(res, {
        error: 'KYC must be approved before creating card'
      })
    }

    // Create card via Holobank API
    const cardResponse = await holobankService.createCard({
      userId: userId,
      accountId: accountId,
      type: type as 'debit' | 'credit' | 'prepaid',
      limit: limit
    })

    if (!cardResponse.success) {
      return responseHandler.badRequest(res, {
        error: cardResponse.message || 'Card creation failed'
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

    // Check if card already exists to avoid duplicates
    const existingCard = user.bankDetails.cards?.find(card => card.cardId === cardResponse.cardId)
    if (!existingCard) {
      user.bankDetails.cards?.push({
        cardId: cardResponse.cardId,
        type: cardResponse.type,
        limit: cardResponse.limit,
        status: cardResponse.status
      })
    }

    await user.save()

    Logger.info(`Card created successfully: ${cardResponse.cardId} for user: ${userId}`)

    return responseHandler.success(res, {
      message: 'Card created successfully',
      data: {
        cardId: cardResponse.cardId,
        type: cardResponse.type,
        limit: cardResponse.limit,
        status: cardResponse.status
      }
    })

  } catch (error) {
    Logger.error('Create card error:', error)
    return responseHandler.serverError(res, {
      error: 'Failed to create card'
    })
  }
}

export const getCards = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const { error, value } = getCardsSchema.validate(req.query)
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

    // Return local database cards
    const cards = user.bankDetails?.cards || []

    return responseHandler.success(res, {
      message: 'Cards retrieved successfully',
      data: cards
    })

  } catch (error) {
    Logger.error('Get cards error:', error)
    return responseHandler.serverError(res, {
      error: 'Failed to retrieve cards'
    })
  }
}

export const updateCardStatus = async (req: Request, res: Response) => {
  try {
    const { userId, cardId } = req.params
    const { status } = req.body

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended', 'expired']
    if (!validStatuses.includes(status)) {
      return responseHandler.badRequest(res, {
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return responseHandler.badRequest(res, {
        error: 'User not found'
      })
    }

    // Find and update card status
    const cardIndex = user.bankDetails?.cards?.findIndex(card => card.cardId === cardId)
    if (cardIndex === -1 || cardIndex === undefined) {
      return responseHandler.badRequest(res, {
        error: 'Card not found'
      })
    }

    if (user.bankDetails?.cards) {
      user.bankDetails.cards[cardIndex].status = status
      await user.save()
    }

    Logger.info(`Card status updated: ${cardId} to ${status} for user: ${userId}`)

    return responseHandler.success(res, {
      message: 'Card status updated successfully',
      data: {
        cardId: cardId,
        status: status
      }
    })

  } catch (error) {
    Logger.error('Update card status error:', error)
    return responseHandler.serverError(res, {
      error: 'Failed to update card status'
    })
  }
}