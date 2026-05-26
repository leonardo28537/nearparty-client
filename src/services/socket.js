import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => socket

export const connectSocket = (accessToken) => {
  if (socket?.connected) return socket

  socket = io('/', {
    auth: { token: accessToken },
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('[Socket] connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] error:', err.message)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// ─── Chat helpers ─────────────────────────────────
export const joinRoom  = (eventId) => socket?.emit('chat:join',  { eventId })
export const leaveRoom = (eventId) => socket?.emit('chat:leave', { eventId })

export const sendMessage = (eventId, text) =>
  socket?.emit('chat:message', { eventId, text })

export const sendTyping = (eventId, isTyping) =>
  socket?.emit('chat:typing', { eventId, isTyping })
