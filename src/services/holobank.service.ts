import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import '@core/declarations'

interface HolobankConfig {
  apiKey: string
  baseURL: string
}

interface KYCUploadResponse {
  success: boolean
  kycId: string
  status: string
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
      baseURL: config.baseURL || 'https://api.holobank.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Add request interceptor to include headers
    this.axiosInstance.interceptors.request.use((config) => {
      config.headers['x-api-key'] = this.apiKey
      config.headers['x-ref-id'] = uuidv4()
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

  /**
   * Upload KYC documents for a user
   */
  async uploadKYC(userId: string, file: any): Promise<KYCUploadResponse> {
    try {
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('document', file)

      const response: AxiosResponse = await this.axiosInstance.post('/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      Logger.error('KYC Upload failed:', error)
      throw error
    }
  }

  /**
   * Update KYC status for a user
   */
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

  /**
   * Create a new account for a user
   */
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

  /**
   * Get accounts for a user
   */
  async getAccounts(userId: string): Promise<AccountResponse[]> {
    try {
      const response: AxiosResponse = await this.axiosInstance.get(`/accounts/${userId}`)
      return response.data
    } catch (error) {
      Logger.error('Get accounts failed:', error)
      throw error
    }
  }

  /**
   * Create a card for an account
   */
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

  /**
   * Transfer funds between accounts
   */
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

  /**
   * Get balance for an account
   */
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
  baseURL: process.env.HOLOBANK_BASE_URL || 'https://api.holobank.com'
})

export default holobankService
export { HolobankService }