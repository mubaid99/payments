import '@core/declarations'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  MetaRequestDto, 
  MetaResponseDto, 
  QuoteRequestDto, 
  QuoteResponseDto,
  SwapRequestDto,
  SwapResponseDto,
  RangoMetaResponse,
  RangoQuoteResponse,
  RangoSwapResponse,
  SwapHistoryRequestDto,
  SwapHistoryResponseDto,
  SwapStatusRequestDto,
  SwapStatusResponseDto
} from '../dto'
import { SwapTransaction, SwapTransactionDoc, IToken, ISwapQuote } from '@models/swap'
import { Types } from 'mongoose'

interface RangoConfig {
  apiKey: string
  baseURL?: string
  timeout?: number
}

class SwapService {
  private axiosInstance: AxiosInstance
  private apiKey: string

  constructor(config: RangoConfig) {
    if (!config.apiKey || config.apiKey.trim() === '') {
      Logger.warn('Rango API key not provided. Some swap features may not work.')
    }
    
    this.apiKey = config.apiKey
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || 'https://api.rango.exchange',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        Logger.error('Rango API Error:', error.response?.data || error.message)
        throw error
      }
    )
  }

  /**
   * Fetch metadata including supported blockchains, tokens, and swappers
   */
  async getMeta(request: MetaRequestDto): Promise<MetaResponseDto> {
    try {
      const response: AxiosResponse<RangoMetaResponse> = await this.axiosInstance.get('/basic/meta', {
        params: {
          apiKey: request.apiKey || this.apiKey
        }
      })

      return {
        success: true,
        blockchains: response.data.blockchains,
        tokens: response.data.tokens,
        swappers: response.data.swappers
      }
    } catch (error) {
      Logger.error('Failed to fetch metadata:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch swap metadata'
      }
    }
  }

  /**
   * Get quote for token swap
   */
  async getQuote(request: QuoteRequestDto): Promise<QuoteResponseDto> {
    try {
      const response: AxiosResponse<RangoQuoteResponse> = await this.axiosInstance.get('/basic/quote', {
        params: {
          from: request.from,
          to: request.to,
          amount: request.amount,
          slippage: request.slippage,
          apiKey: request.apiKey || this.apiKey
        }
      })

      const data = response.data

      if (!data.result || data.resultType === 'NO_ROUTE') {
        return {
          success: false,
          error: 'No swap route available for this token pair',
          diagnosisMessages: data.diagnosisMessages
        }
      }

      if (data.resultType === 'HIGH_IMPACT') {
        Logger.warn('High price impact detected for swap:', {
          from: request.from,
          to: request.to,
          amount: request.amount
        })
      }

      const quote: ISwapQuote = {
        route: {
          from: data.route!.from,
          to: data.route!.to,
          swapper: data.route!.swapper,
          expectedOutput: data.route!.outputAmount,
          path: data.route!.path,
          feePercent: data.route!.feePercent,
          fee: data.route!.fee,
          estimatedTimeInSeconds: data.route!.estimatedTimeInSeconds
        },
        outputAmount: data.route!.outputAmount,
        outputAmountMin: data.route!.outputAmountMin,
        swapper: data.route!.swapper,
        feePercent: data.route!.feePercent,
        fee: data.route!.fee,
        tags: data.route!.tags || [],
        resultType: data.resultType,
        diagnosisMessages: data.diagnosisMessages
      }

      return {
        success: true,
        quote: quote,
        diagnosisMessages: data.diagnosisMessages
      }
    } catch (error) {
      Logger.error('Failed to get quote:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get swap quote'
      }
    }
  }

  /**
   * Create a new swap transaction record
   */
  async createSwapTransaction(request: SwapRequestDto): Promise<SwapResponseDto> {
    try {
      // Parse token information from request
      const fromToken = this.parseTokenString(request.fromToken)
      const toToken = this.parseTokenString(request.toToken)

      if (!fromToken || !toToken) {
        return {
          success: false,
          error: 'Invalid token format. Use format: BLOCKCHAIN.SYMBOL or BLOCKCHAIN--ADDRESS'
        }
      }

      // Get quote if not provided
      let quote = request.quote
      if (!quote) {
        const quoteResponse = await this.getQuote({
          from: request.fromToken,
          to: request.toToken,
          amount: request.amount,
          slippage: request.slippage.toString()
        })

        if (!quoteResponse.success || !quoteResponse.quote) {
          return {
            success: false,
            error: quoteResponse.error || 'Failed to get quote for swap'
          }
        }
        
        quote = quoteResponse.quote
      }

      // Create swap transaction record
      const swapTransaction = SwapTransaction.build({
        userId: request.userId as any,
        fromToken: fromToken,
        toToken: toToken,
        fromAmount: request.amount,
        expectedToAmount: quote.outputAmount,
        slippage: request.slippage,
        userWalletAddress: request.userWalletAddress,
        status: 'PENDING'
      })

      swapTransaction.quote = quote
      await swapTransaction.save()

      return {
        success: true,
        transactionId: swapTransaction._id.toString(),
        message: 'Swap transaction created successfully'
      }
    } catch (error) {
      Logger.error('Failed to create swap transaction:', error)
      return {
        success: false,
        error: 'Failed to create swap transaction'
      }
    }
  }

  /**
   * Get swap transaction history for a user
   */
  async getSwapHistory(request: SwapHistoryRequestDto): Promise<SwapHistoryResponseDto> {
    try {
      const page = request.page || 1
      const limit = request.limit || 10
      const skip = (page - 1) * limit

      // Build query filters
      const query: any = { userId: request.userId }
      
      if (request.status) {
        query.status = request.status
      }

      if (request.fromDate || request.toDate) {
        query.createdAt = {}
        if (request.fromDate) {
          query.createdAt.$gte = new Date(request.fromDate)
        }
        if (request.toDate) {
          query.createdAt.$lte = new Date(request.toDate)
        }
      }

      // Get total count for pagination
      const total = await SwapTransaction.countDocuments(query)
      
      // Get transactions
      const transactions = await SwapTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      const swaps = transactions.map(tx => ({
        id: tx._id.toString(),
        fromToken: tx.fromToken,
        toToken: tx.toToken,
        fromAmount: tx.fromAmount,
        expectedToAmount: tx.expectedToAmount,
        actualToAmount: tx.actualToAmount,
        status: tx.status,
        createdAt: tx.createdAt?.toISOString() || '',
        txHash: tx.txHash,
        error: tx.errorMessage
      }))

      return {
        success: true,
        swaps: swaps,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      Logger.error('Failed to get swap history:', error)
      return {
        success: false,
        error: 'Failed to retrieve swap history'
      }
    }
  }

  /**
   * Get status of a specific swap transaction
   */
  async getSwapStatus(request: SwapStatusRequestDto): Promise<SwapStatusResponseDto> {
    try {
      const transaction = await SwapTransaction.findOne({
        _id: request.transactionId,
        userId: request.userId
      }).lean()

      if (!transaction) {
        return {
          success: false,
          error: 'Swap transaction not found'
        }
      }

      return {
        success: true,
        status: transaction.status,
        transaction: {
          id: transaction._id.toString(),
          fromToken: transaction.fromToken,
          toToken: transaction.toToken,
          fromAmount: transaction.fromAmount,
          expectedToAmount: transaction.expectedToAmount,
          actualToAmount: transaction.actualToAmount,
          status: transaction.status,
          txHash: transaction.txHash,
          blockchainTxId: transaction.blockchainTxId,
          createdAt: transaction.createdAt?.toISOString() || '',
          executedAt: transaction.executedAt?.toISOString(),
          confirmedAt: transaction.confirmedAt?.toISOString(),
          error: transaction.errorMessage
        }
      }
    } catch (error) {
      Logger.error('Failed to get swap status:', error)
      return {
        success: false,
        error: 'Failed to retrieve swap status'
      }
    }
  }

  /**
   * Update swap transaction status
   */
  async updateSwapStatus(
    transactionId: string, 
    status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'SUCCESS',
    updates: Partial<{
      txHash: string
      blockchainTxId: string
      actualToAmount: string
      errorMessage: string
      executedAt: Date
      confirmedAt: Date
    }> = {}
  ): Promise<boolean> {
    try {
      const updateData: any = { status, ...updates }
      
      if (status === 'SUCCESS' && !updates.confirmedAt) {
        updateData.confirmedAt = new Date()
      }
      
      if (status === 'CONFIRMED' && !updates.executedAt) {
        updateData.executedAt = new Date()
      }

      const result = await SwapTransaction.updateOne(
        { _id: transactionId },
        { $set: updateData }
      )

      return result.modifiedCount > 0
    } catch (error) {
      Logger.error('Failed to update swap status:', error)
      return false
    }
  }

  /**
   * Parse token string format (BLOCKCHAIN.SYMBOL or BLOCKCHAIN--ADDRESS)
   */
  private parseTokenString(tokenString: string): IToken | null {
    try {
      // Handle native tokens (e.g., "BSC.BNB")
      if (tokenString.includes('.') && !tokenString.includes('--')) {
        const [blockchain, symbol] = tokenString.split('.')
        return {
          blockchain: blockchain,
          symbol: symbol,
          address: null, // Native token
          decimals: 18, // Default, should be fetched from metadata
          image: '', // Should be fetched from metadata
          isPopular: false
        }
      }

      // Handle token contracts (e.g., "AVAX_CCHAIN--0xc7198437980c041c805a1edcba50c1ce5db95118")
      if (tokenString.includes('--')) {
        const [blockchain, address] = tokenString.split('--')
        return {
          blockchain: blockchain,
          symbol: '', // Should be fetched from metadata
          address: address,
          decimals: 18, // Default, should be fetched from metadata
          image: '', // Should be fetched from metadata
          isPopular: false
        }
      }

      return null
    } catch (error) {
      Logger.error('Failed to parse token string:', error)
      return null
    }
  }
}

// Export singleton instance
const swapService = new SwapService({
  apiKey: App.Config.RANGO.API_KEY || 'c6381a79-2817-4602-83bf-6a641a409e32', // Using example key from documentation
  baseURL: 'https://api.rango.exchange'
})

export default swapService