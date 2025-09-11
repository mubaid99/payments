import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import '@core/declarations'

interface HolobankConfig {
  apiKey: string
  baseURL: string
}

interface KYCUploadResponse {
  success: boolean
  kycId?: string
  message?: string
  status?: string
}

interface KYCData {
  personalIdentificationNumber?: string
  specialCode?: string
  title: string
  firstName: string
  lastName: string
  nationality: string
  occupation: string
  dateOfBirth: string
  placeOfBirth: string
  passportNumber?: string
  passportIssuedBy?: string
  passportIssueDate?: string
  passportExpiryDate?: string
  country: string
  address: string
  district: string
  city: string
  postalCode: string
  isSameResidentialAddress: boolean
  residentialCountry?: string
  residentialAddress?: string
  residentialDistrict?: string
  residentialCity?: string
  residentialPostalCode?: string
  phoneNumber: string
  email: string
  userReferenceId: string
}

interface AccountResponse {
  success: boolean
  accountId: string
  type: string
  currency: string
  balance: number
}

interface CardResponse {
  success: boolean
  cardId: string
  type: string
  limit: number
  status: string
}

interface TransferResponse {
  success: boolean
  transactionId: string
  from: string
  to: string
  amount: number
  currency: string
  status: string
}

interface BalanceResponse {
  success: boolean
  accountId: string
  balance: number
  currency: string
}

class HolobankService {
  private axiosInstance: AxiosInstance
  private apiKey: string

  constructor(config: HolobankConfig) {
    this.apiKey = config.apiKey
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || 'https://sandbox.holobank.net',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Add request interceptor to include headers
    this.axiosInstance.interceptors.request.use((config) => {
      config.headers['Authorization'] = `Bearer ${this.apiKey}`
      return config
    })

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        Logger.error('Holobank API Error:', error.response?.data || error.message)
        throw error
      }
    )
  }

  async uploadKYC(kycData: KYCData, files?: any): Promise<KYCUploadResponse> {
    try {
      const formData = new FormData()
      
      // Add all required fields
      formData.append('title', kycData.title)
      formData.append('firstName', kycData.firstName)
      formData.append('lastName', kycData.lastName)
      formData.append('nationality', kycData.nationality)
      formData.append('occupation', kycData.occupation)
      formData.append('dateOfBirth', kycData.dateOfBirth)
      formData.append('placeOfBirth', kycData.placeOfBirth)
      formData.append('country', kycData.country)
      formData.append('address', kycData.address)
      formData.append('district', kycData.district)
      formData.append('city', kycData.city)
      formData.append('postalCode', kycData.postalCode)
      formData.append('isSameResidentialAddress', kycData.isSameResidentialAddress.toString())
      formData.append('phoneNumber', kycData.phoneNumber)
      formData.append('email', kycData.email)

      // Add optional fields if provided
      if (kycData.personalIdentificationNumber) {
        formData.append('personalIdentificationNumber', kycData.personalIdentificationNumber)
      }
      if (kycData.specialCode) {
        formData.append('specialCode', kycData.specialCode)
      }
      if (kycData.passportNumber) {
        formData.append('passportNumber', kycData.passportNumber)
      }
      if (kycData.passportIssuedBy) {
        formData.append('passportIssuedBy', kycData.passportIssuedBy)
      }
      if (kycData.passportIssueDate) {
        formData.append('passportIssueDate', kycData.passportIssueDate)
      }
      if (kycData.passportExpiryDate) {
        formData.append('passportExpiryDate', kycData.passportExpiryDate)
      }

      // Add residential address if different
      if (!kycData.isSameResidentialAddress) {
        if (kycData.residentialCountry) formData.append('residentialCountry', kycData.residentialCountry)
        if (kycData.residentialAddress) formData.append('residentialAddress', kycData.residentialAddress)
        if (kycData.residentialDistrict) formData.append('residentialDistrict', kycData.residentialDistrict)
        if (kycData.residentialCity) formData.append('residentialCity', kycData.residentialCity)
        if (kycData.residentialPostalCode) formData.append('residentialPostalCode', kycData.residentialPostalCode)
      }

      // Add file uploads if provided
      if (files) {
        if (files.passportImage) {
          formData.append('passportImage', files.passportImage.buffer, files.passportImage.filename)
        }
        if (files.nationalIdImage) {
          formData.append('nationalIdImage', files.nationalIdImage.buffer, files.nationalIdImage.filename)
        }
        if (files.passportSelfie) {
          formData.append('passportSelfie', files.passportSelfie.buffer, files.passportSelfie.filename)
        }
        if (files.nationalIdSelfieImage) {
          formData.append('nationalIdSelfieImage', files.nationalIdSelfieImage.buffer, files.nationalIdSelfieImage.filename)
        }
        if (files.digitalSignature) {
          formData.append('digitalSignature', files.digitalSignature.buffer, files.digitalSignature.filename)
        }
      }

      const response: AxiosResponse = await this.axiosInstance.post('/api/kyc/v1/kyc/private', formData, {
        headers: {
          // Don't set Content-Type manually - let axios handle multipart boundaries
          'x-ref-id': kycData.userReferenceId
        }
      })

      return {
        success: response.status === 204 || response.status === 200,
        kycId: response.data?.kycId || response.data?.id || kycData.userReferenceId,
        message: response.data?.message || 'KYC submitted successfully',
        status: response.data?.status || 'submitted'
      }
    } catch (error) {
      Logger.error('KYC Upload failed:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'KYC upload failed',
        status: 'failed'
      }
    }
  }

  async updateKYCStatus(userId: string, status: string): Promise<any> {
    try {
      const response: AxiosResponse = await this.axiosInstance.put(`/kyc/status/${userId}`, {
        status
      })
      return response.data
    } catch (error) {
      Logger.error('KYC Status update failed:', error)
      throw error
    }
  }

  async createAccount(userId: string, type: string, currency: string): Promise<AccountResponse> {
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/accounts', {
        userId,
        type,
        currency
      })
      return response.data
    } catch (error) {
      Logger.error('Account creation failed:', error)
      throw error
    }
  }

  async getAccounts(userId: string): Promise<AccountResponse[]> {
    try {
      const response: AxiosResponse = await this.axiosInstance.get(`/accounts/${userId}`)
      return response.data
    } catch (error) {
      Logger.error('Get accounts failed:', error)
      throw error
    }
  }

  async createCard(accountId: string, type: string, limit: number): Promise<CardResponse> {
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/cards', {
        accountId,
        type,
        limit
      })
      return response.data
    } catch (error) {
      Logger.error('Card creation failed:', error)
      throw error
    }
  }

  async transfer(from: string, to: string, amount: number, currency: string): Promise<TransferResponse> {
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/transfers', {
        from,
        to,
        amount,
        currency
      })
      return response.data
    } catch (error) {
      Logger.error('Transfer failed:', error)
      throw error
    }
  }

  async getBalance(accountId: string): Promise<BalanceResponse> {
    try {
      const response: AxiosResponse = await this.axiosInstance.get(`/accounts/${accountId}/balance`)
      return response.data
    } catch (error) {
      Logger.error('Get balance failed:', error)
      throw error
    }
  }
}

// Export singleton instance
const holobankService = new HolobankService({
  apiKey: process.env.HOLOBANK_API_KEY || '',
  baseURL: process.env.HOLOBANK_API || 'https://sandbox.holobank.net'
})

export default holobankService