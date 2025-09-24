import axios, { AxiosInstance, AxiosResponse } from 'axios'
import FormData from 'form-data'
import { v4 as uuidv4 } from 'uuid'
import '@core/declarations'

interface HolobankConfig {
  apiKey: string
  baseURL: string
}

interface UserCreationResponse {
  success: boolean
  userId?: string
  platformAccountId?: string
  message?: string
}

interface UserCreationData {
  userReferenceId: string
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
  message?: string
}

interface AccountData {
  userId: string
  type: 'PLATFORM' | 'REAP' | 'JDB'
  currency: 'USDC' | 'USD' | 'EUR' | 'GBP'
}

interface DepositInfoResponse {
  success: boolean
  walletAddress?: string
  currency?: string
  network?: string
  message?: string
}

interface KYCListResponse {
  success: boolean
  kycs?: Array<{
    id: string
    status: string
    userId: string
  }>
  message?: string
}

interface KYCStatusUpdateResponse {
  success: boolean
  kycId: string
  status: string
  message?: string
}

interface CardResponse {
  success: boolean
  cardId: string
  type: string
  limit: number
  status: string
  message?: string
}

interface CardData {
  userId: string
  accountId: string
  type: 'debit' | 'credit' | 'prepaid'
  limit: number
  productId: number
}

interface TransferResponse {
  success: boolean
  transactionId: string
  from: string
  to: string
  amount: number
  currency: string
  status: string
  message?: string
}

interface TransferData {
  userId: string
  fromAccountId: string
  toAccountId: string
  amount: number
  currency: string
}

interface BalanceResponse {
  success: boolean
  accountId: string
  balance: number
  currency: string
  lastUpdated: Date
  message?: string
}

class HolobankService {
  private axiosInstance: AxiosInstance
  private apiKey: string

  constructor(config: HolobankConfig) {
    // Fail-fast configuration validation
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new Error('HOLOBANK_API_KEY is required but not provided in environment configuration')
    }
    
    this.apiKey = config.apiKey
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || 'https://sandbox.holobank.net',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Add request interceptor to include Holobank headers
    this.axiosInstance.interceptors.request.use((config) => {
      config.headers['x-apy-key'] = this.apiKey
      // x-ref-id will be set per request as it's user-specific
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

  async createCoreUser(userData: UserCreationData): Promise<UserCreationResponse> {
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/api/core/v1/users', {}, {
        headers: {
          'x-ref-id': userData.userReferenceId
        }
      })

      // Core user creation auto-creates PLATFORM account with USDC
      return {
        success: true,
        userId: response.data.userId || response.data.id,
        platformAccountId: response.data.platformAccountId || response.data.accounts?.[0]?.id,
        message: 'Core user and PLATFORM account created successfully'
      }
    } catch (error) {
      Logger.error('Core user creation failed:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Core user creation failed'
      }
    }
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

      const response: AxiosResponse = await this.axiosInstance.post('/api/kyc/v1/kyc', formData, {
        headers: {
          ...formData.getHeaders(),
          'x-ref-id': kycData.userReferenceId
        }
      })

      // Accept any 2xx status code (200-299) as success
      const isSuccess = response.status >= 200 && response.status < 300
      
      // Handle 201 responses that may return ID in response body or Location header
      let kycId = response.data?.kycId || response.data?.id || kycData.userReferenceId
      if (response.status === 201 && response.headers?.location) {
        // Extract ID from Location header if present (e.g., "/api/kyc/v1/kyc/12345")
        const locationMatch = response.headers.location.match(/\/([^/]+)$/) 
        if (locationMatch) {
          kycId = locationMatch[1]
        }
      }
      
      return {
        success: isSuccess,
        kycId: kycId,
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

  async listKYCs(userReferenceId: string): Promise<KYCListResponse> {
    try {
      const response: AxiosResponse = await this.axiosInstance.get('/api/kyc/v1/kyc', {
        headers: {
          'x-ref-id': userReferenceId
        }
      })
      
      return {
        success: true,
        kycs: response.data.kycs || response.data || [],
        message: 'KYCs retrieved successfully'
      }
    } catch (error) {
      Logger.error('List KYCs failed:', error)
      return {
        success: false,
        kycs: [],
        message: error.response?.data?.message || 'Failed to retrieve KYCs'
      }
    }
  }

  async updateKYCStatus(kycId: string, userReferenceId: string, status: string): Promise<KYCStatusUpdateResponse> {
    try {
      const response: AxiosResponse = await this.axiosInstance.put(`/api/kyc/v1/kyc/${kycId}/status`, {
        status
      }, {
        headers: {
          'x-ref-id': userReferenceId
        }
      })
      
      return {
        success: true,
        kycId: kycId,
        status: response.data.status || status,
        message: 'KYC status updated successfully'
      }
    } catch (error) {
      Logger.error('KYC Status update failed:', error)
      return {
        success: false,
        kycId: kycId,
        status: 'failed',
        message: error.response?.data?.message || 'KYC status update failed'
      }
    }
  }

  async createAccount(accountData: AccountData, userReferenceId: string): Promise<AccountResponse> {
    try {
      // Create bank account (REAP or JDB only, PLATFORM is auto-created)
      const response: AxiosResponse = await this.axiosInstance.post('/api/accounts/v1/accounts', {
        type: accountData.type,
        currency: accountData.currency
      }, {
        headers: {
          'x-ref-id': userReferenceId
        }
      })
      
      return {
        success: true,
        accountId: response.data.accountId || response.data.id,
        type: response.data.type,
        currency: response.data.currency,
        balance: response.data.balance || 0,
        message: `${accountData.type} account created successfully`
      }
    } catch (error) {
      Logger.error('Account creation failed:', error)
      return {
        success: false,
        accountId: '',
        type: accountData.type,
        currency: accountData.currency,
        balance: 0,
        message: error.response?.data?.message || 'Account creation failed'
      }
    }
  }

  async getDepositInfo(accountId: string, userReferenceId: string): Promise<DepositInfoResponse> {
    try {
      const response: AxiosResponse = await this.axiosInstance.get(`/api/accounts/v1/accounts/${accountId}/deposit`, {
        headers: {
          'x-ref-id': userReferenceId
        }
      })
      
      return {
        success: true,
        walletAddress: response.data.walletAddress || response.data.address,
        currency: response.data.currency,
        network: response.data.network,
        message: 'Deposit info retrieved successfully'
      }
    } catch (error) {
      Logger.error('Get deposit info failed:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get deposit info'
      }
    }
  }

  async getAccounts(userReferenceId: string): Promise<AccountResponse[]> {
    try {
      const response: AxiosResponse = await this.axiosInstance.get('/api/accounts/v1/accounts', {
        headers: {
          'x-ref-id': userReferenceId
        }
      })
      
      const accounts = response.data.accounts || response.data || []
      return accounts.map((account: any) => ({
        success: true,
        accountId: account.accountId || account.id,
        type: account.type,
        currency: account.currency,
        balance: account.balance || 0,
        message: 'Account retrieved successfully'
      }))
    } catch (error) {
      Logger.error('Get accounts failed:', error)
      return []
    }
  }

  async createCard(cardData: CardData, userReferenceId: string): Promise<CardResponse> {
    try {
      // Fixed card creation with productId 9 for REAP/JDB accounts only
      const response: AxiosResponse = await this.axiosInstance.post('/api/cards/v1/cards', {
        accountId: cardData.accountId,
        productId: cardData.productId || 9,
        type: cardData.type,
        limit: cardData.limit
      }, {
        headers: {
          'x-ref-id': userReferenceId
        }
      })
      
      return {
        success: true,
        cardId: response.data.cardId || response.data.id,
        type: response.data.type,
        limit: response.data.limit,
        status: response.data.status || 'active',
        message: 'Card created successfully'
      }
    } catch (error) {
      Logger.error('Card creation failed:', error)
      return {
        success: false,
        cardId: '',
        type: cardData.type,
        limit: cardData.limit,
        status: 'failed',
        message: error.response?.data?.message || 'Card creation failed'
      }
    }
  }

  async transfer(transferData: TransferData, userReferenceId: string): Promise<TransferResponse> {
    try {
      // Bank account transfer (PLATFORM to REAP typically)
      const response: AxiosResponse = await this.axiosInstance.post('/api/accounts/v1/transfer', {
        fromAccountId: transferData.fromAccountId,
        toAccountId: transferData.toAccountId,
        amount: transferData.amount,
        currency: transferData.currency
      }, {
        headers: {
          'x-ref-id': userReferenceId
        }
      })
      
      return {
        success: true,
        transactionId: response.data.transactionId || response.data.id,
        from: transferData.fromAccountId,
        to: transferData.toAccountId,
        amount: transferData.amount,
        currency: transferData.currency,
        status: response.data.status || 'completed',
        message: 'Transfer completed successfully'
      }
    } catch (error) {
      Logger.error('Transfer failed:', error)
      return {
        success: false,
        transactionId: '',
        from: transferData.fromAccountId,
        to: transferData.toAccountId,
        amount: transferData.amount,
        currency: transferData.currency,
        status: 'failed',
        message: error.response?.data?.message || 'Transfer failed'
      }
    }
  }

  async getBalance(accountId: string, userReferenceId: string): Promise<BalanceResponse> {
    try {
      // Get bank account balance
      const response: AxiosResponse = await this.axiosInstance.get(`/api/accounts/v1/accounts/${accountId}/balance`, {
        headers: {
          'x-ref-id': userReferenceId
        }
      })
      
      return {
        success: true,
        accountId: accountId,
        balance: response.data.balance || response.data.availableBalance || 0,
        currency: response.data.currency,
        lastUpdated: new Date(response.data.lastUpdated || Date.now()),
        message: 'Balance retrieved successfully'
      }
    } catch (error) {
      Logger.error('Get balance failed:', error)
      return {
        success: false,
        accountId: accountId,
        balance: 0,
        currency: 'USDC',
        lastUpdated: new Date(),
        message: error.response?.data?.message || 'Failed to retrieve balance'
      }
    }
  }
}

// Export singleton instance
const holobankService = new HolobankService({
  apiKey: App.Config.HOLOBANK.API_KEY || '',
  baseURL: App.Config.HOLOBANK.API_URL || 'https://sandbox.holobank.net'
})

export default holobankService