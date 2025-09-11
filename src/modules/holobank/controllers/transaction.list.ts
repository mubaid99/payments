import { Request, Response } from 'express'
import { Transaction } from '@models/transaction'
import '@core/declarations'

/**
 * Get user transactions with pagination and filtering
 * GET /holobank/transactions
 */
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { userId, status, type, page = 1, limit = 10 } = req.query

    if (!userId) {
      return (res as any).badRequest({ 
        error: 'User ID is required' 
      })
    }

    // Build query filter
    const filter: any = { userId }
    
    if (status) {
      filter.status = status
    }
    
    if (type) {
      filter.type = type
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Execute query with pagination
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Transaction.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalCount / Number(limit))

    return (res as any).success({
      data: {
        transactions,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    })

  } catch (error) {
    Logger.error('Get Transactions Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}

/**
 * Get single transaction details
 * GET /holobank/transaction/:transactionId
 */
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params
    const { userId } = req.query

    if (!userId) {
      return (res as any).badRequest({ 
        error: 'User ID is required' 
      })
    }

    const transaction = await Transaction.findOne({
      $or: [
        { transactionId },
        { holobankTransactionId: transactionId }
      ],
      userId
    }).lean()

    if (!transaction) {
      return (res as any).notFound({ 
        error: 'Transaction not found' 
      })
    }

    return (res as any).success({
      data: transaction
    })

  } catch (error) {
    Logger.error('Get Transaction By ID Error:', error)
    return (res as any).internalServerError({ 
      error: error.message 
    })
  }
}