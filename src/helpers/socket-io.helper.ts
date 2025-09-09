import { Server } from "socket.io"
import { Server as HttpServer } from "http"
import HolobankSocketHandler from '../sockets/holobank.socket'
import '@core/declarations'

let io: Server
let holobankHandler: HolobankSocketHandler

/**
 * Initialize Socket.IO on the given HTTP server
 */
export default function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // 🔒 restrict in prod
      methods: ["GET", "POST"],
    },
  })

  // Make io globally available for notifications
  global.io = io

  // Initialize Holobank socket handlers
  holobankHandler = new HolobankSocketHandler(io)
  holobankHandler.initializeHandlers()

  io.on("connection", (socket) => {
    Logger.info(`🔌 Client connected: ${socket.id}`)

    socket.on("disconnect", () => {
      Logger.info(`❌ Client disconnected: ${socket.id}`)
    })
  })

  return io
}

/**
 * Get the Socket.IO instance anywhere in the app
 */
export function getIO(): Server {
  if (!io) {
    throw new Error("❌ Socket.io not initialized! Call initializeSocket first.")
  }
  return io
}

/**
 * Get the Holobank socket handler instance
 */
export function getHolobankHandler(): HolobankSocketHandler {
  if (!holobankHandler) {
    throw new Error("❌ Holobank socket handler not initialized!")
  }
  return holobankHandler
}
