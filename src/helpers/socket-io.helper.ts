import { Server } from "socket.io"
import { Server as HttpServer } from "http"

let io: Server

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

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`)
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
