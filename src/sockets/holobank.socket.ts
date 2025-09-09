import { Server, Socket } from 'socket.io'
import '@core/declarations'

interface HolobankSocketData {
  userId: string
  accountId?: string
}

export class HolobankSocketHandler {
  private io: Server

  constructor(io: Server) {
    this.io = io
  }

  /**
   * Initialize Holobank WebSocket event handlers
   */
  initializeHandlers() {
    this.io.on('connection', (socket: Socket) => {
      Logger.info(`Client connected: ${socket.id}`)

      // Handle user joining their personal room for notifications
      socket.on('holobank:join', (data: HolobankSocketData) => {
        const { userId } = data
        if (!userId) {
          socket.emit('holobank:error', { message: 'User ID is required' })
          return
        }

        // Join user to their personal room
        socket.join(userId)
        Logger.info(`User ${userId} joined Holobank room`)
        
        socket.emit('holobank:joined', { 
          message: 'Successfully joined Holobank notifications',
          userId 
        })
      })

      // Handle leaving the room
      socket.on('holobank:leave', (data: HolobankSocketData) => {
        const { userId } = data
        if (userId) {
          socket.leave(userId)
          Logger.info(`User ${userId} left Holobank room`)
        }
      })

      // Handle balance subscription
      socket.on('holobank:subscribe_balance', (data: HolobankSocketData) => {
        const { userId, accountId } = data
        if (!userId || !accountId) {
          socket.emit('holobank:error', { 
            message: 'User ID and Account ID are required' 
          })
          return
        }

        // Join specific account balance room
        const balanceRoom = `balance_${accountId}`
        socket.join(balanceRoom)
        Logger.info(`User ${userId} subscribed to balance updates for account ${accountId}`)
        
        socket.emit('holobank:balance_subscribed', { 
          message: 'Subscribed to balance updates',
          accountId 
        })
      })

      // Handle transaction subscription
      socket.on('holobank:subscribe_transactions', (data: HolobankSocketData) => {
        const { userId } = data
        if (!userId) {
          socket.emit('holobank:error', { message: 'User ID is required' })
          return
        }

        // Join transaction updates room
        const transactionRoom = `transactions_${userId}`
        socket.join(transactionRoom)
        Logger.info(`User ${userId} subscribed to transaction updates`)
        
        socket.emit('holobank:transactions_subscribed', { 
          message: 'Subscribed to transaction updates',
          userId 
        })
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        Logger.info(`Client disconnected: ${socket.id}`)
      })
    })
  }

  /**
   * Broadcast transaction update to user
   */
  broadcastTransaction(userId: string, transactionData: any) {
    this.io.to(userId).emit('holobank:transactions', {
      type: 'transaction_update',
      data: transactionData,
      timestamp: new Date()
    })

    this.io.to(`transactions_${userId}`).emit('holobank:transactions', {
      type: 'transaction_update', 
      data: transactionData,
      timestamp: new Date()
    })
  }

  /**
   * Broadcast balance update to user and account subscribers
   */
  broadcastBalanceUpdate(userId: string, accountId: string, balanceData: any) {
    // Send to user's personal room
    this.io.to(userId).emit('holobank:balanceUpdate', {
      type: 'balance_update',
      data: balanceData,
      timestamp: new Date()
    })

    // Send to account-specific balance room
    this.io.to(`balance_${accountId}`).emit('holobank:balanceUpdate', {
      type: 'balance_update',
      data: balanceData,
      timestamp: new Date()
    })
  }

  /**
   * Broadcast KYC status update
   */
  broadcastKYCStatusUpdate(userId: string, kycData: any) {
    this.io.to(userId).emit('holobank:kyc_update', {
      type: 'kyc_status_update',
      data: kycData,
      timestamp: new Date()
    })
  }

  /**
   * Broadcast card status update
   */
  broadcastCardStatusUpdate(userId: string, cardData: any) {
    this.io.to(userId).emit('holobank:card_update', {
      type: 'card_status_update',
      data: cardData,
      timestamp: new Date()
    })
  }
}

export default HolobankSocketHandler