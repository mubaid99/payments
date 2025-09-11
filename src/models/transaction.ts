import { Schema, model, Document } from 'mongoose'

export interface ITransaction extends Document {
  _id: string
  userId: Schema.Types.ObjectId
  transactionId: string
  holobankTransactionId: string
  type: 'debit' | 'credit' | 'transfer' | 'deposit' | 'withdrawal'
  amount: number
  currency: string
  fromAccountId?: string
  toAccountId?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  metadata?: any
  webhookData?: any
  createdAt: Date
  updatedAt: Date
  processedAt?: Date
}

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  holobankTransactionId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['debit', 'credit', 'transfer', 'deposit', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP']
  },
  fromAccountId: {
    type: String,
    index: true
  },
  toAccountId: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  description: String,
  metadata: Schema.Types.Mixed,
  webhookData: Schema.Types.Mixed,
  processedAt: Date
}, {
  timestamps: true,
  collection: 'transactions'
})

// Indexes for efficient querying
transactionSchema.index({ userId: 1, status: 1 })
transactionSchema.index({ userId: 1, createdAt: -1 })
transactionSchema.index({ fromAccountId: 1, createdAt: -1 })
transactionSchema.index({ toAccountId: 1, createdAt: -1 })

export const Transaction = model<ITransaction>('Transaction', transactionSchema)