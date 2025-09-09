import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import '@core/declarations'

/**
 * Upload KYC documents for a user
 * POST /holobank/kyc
 */
export const uploadKYC = async (req: Request, res: Response) => {
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