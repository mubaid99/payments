import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import '@core/declarations'

/**
 * List KYCs for user
 * GET /holobank/kyc/list
 */
export const listKYCs = async (req: Request, res: Response) => {
  try {
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

    if (!user.bankDetails?.userReferenceId) {
      return (res as any).badRequest({ 
        error: 'Core user must be created first' 
      })
    }

    // List KYCs from Holobank
    const kycResponse = await holobankService.listKYCs(user.bankDetails.userReferenceId)

    if (!kycResponse.success) {
      return (res as any).badRequest({ 
        error: kycResponse.message || 'Failed to retrieve KYCs' 
      })
    }

    return (res as any).success({
      data: {
        kycs: kycResponse.kycs,
        message: 'KYCs retrieved successfully'
      }
    })

  } catch (error) {
    Logger.error('List KYCs Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}

/**
 * Update KYC status
 * PUT /holobank/kyc/status
 */
export const updateKYCStatus = async (req: Request, res: Response) => {
  try {
    const { kycId, status } = req.body
    const authenticatedUser = (req as any).user
    
    if (!authenticatedUser) {
      return (res as any).unauthorized({ 
        error: 'User authentication required' 
      })
    }
    
    if (!kycId || !status) {
      return (res as any).badRequest({ 
        error: 'KYC ID and status are required' 
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

    // Update KYC status with Holobank
    const statusResponse = await holobankService.updateKYCStatus(
      kycId, 
      user.bankDetails.userReferenceId, 
      status
    )

    if (!statusResponse.success) {
      return (res as any).badRequest({ 
        error: statusResponse.message || 'Failed to update KYC status' 
      })
    }

    // Update local KYC status
    user.bankDetails.kycStatus = status
    user.bankDetails.kycId = kycId
    await user.save()

    // Emit real-time update
    const io = global.io
    if (io) {
      io.to(userId).emit('holobank:kycStatusUpdate', {
        kycId: kycId,
        status: status
      })
    }

    return (res as any).success({
      data: {
        kycId: statusResponse.kycId,
        status: statusResponse.status,
        message: 'KYC status updated successfully'
      }
    })

  } catch (error) {
    Logger.error('Update KYC Status Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}