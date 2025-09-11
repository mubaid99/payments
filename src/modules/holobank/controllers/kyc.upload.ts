import { Request, Response } from 'express'
import holobankService from '../services'
import { User } from '@models/user'
import '@core/declarations'

/**
 * Upload KYC documents for a user with Holobank API
 * POST /holobank/kyc
 */
export const uploadKYC = async (req: Request, res: Response) => {
  try {
    const {
      personalIdentificationNumber,
      specialCode,
      title,
      firstName,
      lastName,
      nationality,
      occupation,
      dateOfBirth,
      placeOfBirth,
      passportNumber,
      passportIssuedBy,
      passportIssueDate,
      passportExpiryDate,
      country,
      address,
      district,
      city,
      postalCode,
      isSameResidentialAddress,
      residentialCountry,
      residentialAddress,
      residentialDistrict,
      residentialCity,
      residentialPostalCode,
      phoneNumber,
      email
    } = req.body
    const authenticatedUser = (req as any).user
    
    if (!authenticatedUser) {
      return (res as any).unauthorized({ 
        error: 'User authentication required' 
      })
    }

    // Validate required fields according to Holobank API
    const requiredFields = [
      'title', 'firstName', 'lastName', 'nationality', 
      'occupation', 'dateOfBirth', 'placeOfBirth', 'country', 
      'address', 'district', 'city', 'postalCode', 'phoneNumber', 'email'
    ]

    const missingFields = requiredFields.filter(field => !req.body[field])
    if (missingFields.length > 0) {
      return (res as any).badRequest({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      })
    }

    // Validate occupation enum (as per Holobank docs)
    const validOccupations = ['Employee', 'Public Staff', 'Staff', 'General Customer', 'Special Customer', 'Agent']
    if (!validOccupations.includes(occupation)) {
      return (res as any).badRequest({ 
        error: `Invalid occupation. Must be one of: ${validOccupations.join(', ')}` 
      })
    }

    // Get uploaded files and format them properly for FormData
    const rawFiles = (req as any).files
    let files = undefined
    
    if (rawFiles) {
      files = {}
      // Handle express-fileupload format
      Object.keys(rawFiles).forEach(key => {
        const file = rawFiles[key]
        if (file && file.data) {
          files[key] = {
            buffer: file.data,
            filename: file.name,
            mimetype: file.mimetype
          }
        }
      })
    }

    // Get user and validate
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

    // Prepare KYC data in Holobank format
    const kycData = {
      personalIdentificationNumber,
      specialCode,
      title,
      firstName,
      lastName,
      nationality,
      occupation,
      dateOfBirth,
      placeOfBirth,
      passportNumber,
      passportIssuedBy,
      passportIssueDate,
      passportExpiryDate,
      country,
      address,
      district,
      city,
      postalCode,
      isSameResidentialAddress: isSameResidentialAddress === 'true' || isSameResidentialAddress === true,
      residentialCountry,
      residentialAddress,
      residentialDistrict,
      residentialCity,
      residentialPostalCode,
      phoneNumber,
      email,
      userReferenceId: user.bankDetails!.userReferenceId!
    }

    // Upload KYC to Holobank
    const kycResponse = await holobankService.uploadKYC(kycData, files)

    if (!kycResponse.success) {
      return (res as any).badRequest({ 
        error: 'Failed to upload KYC documents' 
      })
    }

    // Update user's KYC status
    user.bankDetails.kycStatus = kycResponse.status || 'submitted'
    user.bankDetails.kycId = kycResponse.kycId

    await user.save()

    return (res as any).success({
      data: {
        kycId: kycResponse.kycId,
        status: kycResponse.status || 'submitted',
        message: kycResponse.message || 'KYC documents uploaded successfully'
      }
    })

  } catch (error) {
    Logger.error('KYC Upload Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}