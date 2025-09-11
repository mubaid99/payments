import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import '@core/declarations'

/**
 * Create core user with Holobank
 * Creates a core user and auto-creates PLATFORM account with USDC
 * POST /holobank/user
 */
export const createCoreUser = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body
    const authenticatedUser = (req as any).user
    
    if (!authenticatedUser) {
      return (res as any).unauthorized({ 
        error: 'User authentication required' 
      })
    }
    
    const userId = authenticatedUser._id.toString()
    const user = await User.findById(userId)
    if (!user) {
      return (res as any).notFound({ 
        error: 'User not found' 
      })
    }

    // Check if user already has Holobank core user created
    if (user.bankDetails?.holobankUserId) {
      return (res as any).badRequest({ 
        error: 'Core user already exists for this user' 
      })
    }

    // Generate unique reference ID for the user
    const userReferenceId = `${userId}_${Date.now()}`

    // Create core user with Holobank (auto-creates PLATFORM account)
    const userResponse = await holobankService.createCoreUser({
      userReferenceId
    })

    if (!userResponse.success) {
      return (res as any).badRequest({ 
        error: userResponse.message || 'Failed to create core user' 
      })
    }

    // Initialize or update user's bank details
    if (!user.bankDetails) {
      user.bankDetails = {
        holobankUserId: userResponse.userId,
        userReferenceId: userReferenceId,
        kycStatus: 'pending',
        accounts: [],
        cards: []
      }
    } else {
      user.bankDetails.holobankUserId = userResponse.userId
      user.bankDetails.userReferenceId = userReferenceId
    }

    // Add PLATFORM account (auto-created)
    if (userResponse.platformAccountId) {
      user.bankDetails.accounts.push({
        accountId: userResponse.platformAccountId,
        type: 'PLATFORM',
        currency: 'USDC',
        balance: 0
      })
    }

    await user.save()

    return (res as any).success({
      data: {
        holobankUserId: userResponse.userId,
        platformAccountId: userResponse.platformAccountId,
        userReferenceId: userReferenceId,
        message: 'Core user created successfully with PLATFORM account'
      }
    })

  } catch (error) {
    Logger.error('Create Core User Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}