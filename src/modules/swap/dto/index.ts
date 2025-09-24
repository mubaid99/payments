import { IToken, ISwapQuote, IBlockchain, ISwapper } from '@models/swap'

// Request DTOs
export interface MetaRequestDto {
  apiKey?: string
}

export interface QuoteRequestDto {
  from: string  // Format: BLOCKCHAIN.TOKEN or BLOCKCHAIN--TOKEN_ADDRESS
  to: string    // Format: BLOCKCHAIN.TOKEN or BLOCKCHAIN--TOKEN_ADDRESS
  amount: string
  slippage: string
  apiKey?: string
  userWalletAddress?: string
}

export interface SwapRequestDto {
  userId: string
  fromToken: string
  toToken: string
  amount: string
  slippage: number
  userWalletAddress: string
  quote?: ISwapQuote
}

export interface ExecuteSwapRequestDto extends SwapRequestDto {
  userPrivateKey?: string
  maxGasPrice?: string
  gasLimit?: string
}

// Response DTOs
export interface MetaResponseDto {
  success: boolean
  blockchains?: IBlockchain[]
  tokens?: IToken[]
  swappers?: ISwapper[]
  error?: string
}

export interface QuoteResponseDto {
  success: boolean
  quote?: ISwapQuote
  routes?: ISwapQuote[]
  requestId?: string
  error?: string
  diagnosisMessages?: string[]
}

export interface SwapResponseDto {
  success: boolean
  transactionId?: string
  swapId?: string
  txData?: {
    to: string
    data: string
    value: string
    gasLimit: string
    gasPrice: string
  }
  error?: string
  message?: string
}

export interface SwapHistoryRequestDto {
  userId: string
  status?: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'SUCCESS'
  page?: number
  limit?: number
  fromDate?: string
  toDate?: string
}

export interface SwapHistoryResponseDto {
  success: boolean
  swaps?: Array<{
    id: string
    fromToken: IToken
    toToken: IToken
    fromAmount: string
    expectedToAmount: string
    actualToAmount?: string
    status: string
    createdAt: string
    txHash?: string
    error?: string
  }>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

export interface SwapStatusRequestDto {
  transactionId: string
  userId: string
}

export interface SwapStatusResponseDto {
  success: boolean
  status?: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'SUCCESS'
  transaction?: {
    id: string
    fromToken: IToken
    toToken: IToken
    fromAmount: string
    expectedToAmount: string
    actualToAmount?: string
    status: string
    txHash?: string
    blockchainTxId?: string
    createdAt: string
    executedAt?: string
    confirmedAt?: string
    error?: string
  }
  error?: string
}

// Validation DTOs
export interface TokenValidationDto {
  blockchain: string
  symbol: string
  address?: string
}

export interface SwapValidationDto {
  fromToken: TokenValidationDto
  toToken: TokenValidationDto
  amount: string
  slippage: number
  userWalletAddress: string
}

// Rango API Response Types (external API responses)
export interface RangoMetaResponse {
  blockchains: IBlockchain[]
  tokens: IToken[]
  swappers: ISwapper[]
}

export interface RangoQuoteResponse {
  route?: {
    from: IToken
    to: IToken
    swapper: ISwapper
    path: IToken[]
    outputAmount: string
    outputAmountMin: string
    fee: string
    feePercent: number
    estimatedTimeInSeconds: number
    tags: string[]
  }
  result?: boolean
  resultType?: 'OK' | 'HIGH_IMPACT' | 'NO_ROUTE'
  diagnosisMessages?: string[]
  error?: string
}

export interface RangoSwapResponse {
  route: any
  tx?: {
    to: string
    data: string
    value: string
    gasLimit: string
    gasPrice: string
  }
  transactionId?: string
  error?: string
}