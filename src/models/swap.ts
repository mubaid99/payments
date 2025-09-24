import { BaseModel } from '@core/database'
import { Document, model, Model, Schema } from 'mongoose'
const { ObjectId } = Schema.Types

// Interfaces for swap-related data
export interface IBlockchain {
  name: string
  displayName: string
  shortName: string
  chainId?: string
  logo: string
  type: string
  enabled: boolean
}

export interface IToken {
  blockchain: string
  symbol: string
  address: string | null
  decimals: number
  image: string
  coinGeckoId?: string
  usdPrice?: number
  isPopular?: boolean
}

export interface ISwapper {
  id: string
  title: string
  logo: string
  types: string[]
}

export interface ISwapRoute {
  from: IToken
  to: IToken
  swapper: ISwapper
  expectedOutput: string
  path: IToken[]
  feePercent: number
  fee: string
  estimatedTimeInSeconds: number
}

export interface ISwapQuote {
  route: ISwapRoute
  outputAmount: string
  outputAmountMin: string
  swapper: ISwapper
  feePercent: number
  fee: string
  tags: string[]
  resultType: 'OK' | 'HIGH_IMPACT' | 'NO_ROUTE'
  diagnosisMessages?: string[]
}

// Swap Transaction Schema
export interface SwapTransactionInput {
  userId: typeof ObjectId
  fromToken: IToken
  toToken: IToken
  fromAmount: string
  expectedToAmount: string
  slippage: number
  userWalletAddress: string
  routeId?: string
  rangoTransactionId?: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'SUCCESS'
}

interface SwapTransactionAttrs extends SwapTransactionInput {}

export interface SwapTransactionDoc extends BaseModel, Document {
  _id: typeof ObjectId
  userId: typeof ObjectId
  fromToken: IToken
  toToken: IToken
  fromAmount: string
  expectedToAmount: string
  actualToAmount?: string
  slippage: number
  userWalletAddress: string
  routeId?: string
  rangoTransactionId?: string
  txHash?: string
  blockchainTxId?: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'SUCCESS'
  errorMessage?: string
  quote?: ISwapQuote
  executedAt?: Date
  confirmedAt?: Date
}

export interface SwapTransactionModel extends Model<SwapTransactionDoc> {
  build(attrs: SwapTransactionAttrs): SwapTransactionDoc
}

// Token Schema (embedded)
const TokenSchema = new Schema<IToken>({
  blockchain: { type: String, required: true },
  symbol: { type: String, required: true },
  address: { type: String, default: null },
  decimals: { type: Number, required: true },
  image: { type: String, required: true },
  coinGeckoId: String,
  usdPrice: Number,
  isPopular: { type: Boolean, default: false }
}, { _id: false })

// Swapper Schema (embedded)
const SwapperSchema = new Schema<ISwapper>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  logo: { type: String, required: true },
  types: [String]
}, { _id: false })

// Swap Route Schema (embedded)
const SwapRouteSchema = new Schema<ISwapRoute>({
  from: { type: TokenSchema, required: true },
  to: { type: TokenSchema, required: true },
  swapper: { type: SwapperSchema, required: true },
  expectedOutput: { type: String, required: true },
  path: [TokenSchema],
  feePercent: { type: Number, required: true },
  fee: { type: String, required: true },
  estimatedTimeInSeconds: { type: Number, required: true }
}, { _id: false })

// Swap Quote Schema (embedded)
const SwapQuoteSchema = new Schema<ISwapQuote>({
  route: { type: SwapRouteSchema, required: true },
  outputAmount: { type: String, required: true },
  outputAmountMin: { type: String, required: true },
  swapper: { type: SwapperSchema, required: true },
  feePercent: { type: Number, required: true },
  fee: { type: String, required: true },
  tags: [String],
  resultType: { 
    type: String, 
    enum: ['OK', 'HIGH_IMPACT', 'NO_ROUTE'], 
    required: true 
  },
  diagnosisMessages: [String]
}, { _id: false })

// Main Swap Transaction Schema
const SwapTransactionSchema = new Schema<SwapTransactionDoc>(
  {
    userId: { 
      type: ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    fromToken: { 
      type: TokenSchema, 
      required: true 
    },
    toToken: { 
      type: TokenSchema, 
      required: true 
    },
    fromAmount: { 
      type: String, 
      required: true 
    },
    expectedToAmount: { 
      type: String, 
      required: true 
    },
    actualToAmount: String,
    slippage: { 
      type: Number, 
      required: true, 
      min: 0, 
      max: 50 
    },
    userWalletAddress: { 
      type: String, 
      required: true 
    },
    routeId: String,
    rangoTransactionId: String,
    txHash: String,
    blockchainTxId: String,
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'FAILED', 'SUCCESS'],
      default: 'PENDING',
      index: true
    },
    errorMessage: String,
    quote: SwapQuoteSchema,
    executedAt: Date,
    confirmedAt: Date
  },
  {
    timestamps: true,
    versionKey: false,
    autoIndex: true
  }
)

// Indexes for better query performance
SwapTransactionSchema.index({ userId: 1, status: 1 })
SwapTransactionSchema.index({ userId: 1, createdAt: -1 })
SwapTransactionSchema.index({ rangoTransactionId: 1 })
SwapTransactionSchema.index({ txHash: 1 })

// Static method to build new swap transaction
SwapTransactionSchema.statics.build = (attrs: SwapTransactionAttrs) => {
  return new SwapTransaction(attrs)
}

export const SwapTransaction = model<SwapTransactionDoc, SwapTransactionModel>(
  'SwapTransaction', 
  SwapTransactionSchema
)

export { SwapTransactionSchema }