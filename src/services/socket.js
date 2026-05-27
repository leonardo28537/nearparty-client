import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => socket

export const connectSocket = (accessToken) => {
  if (socket?.connected) return socket

  // En producción apunta al backend real, en local usa el proxy de Vite
  const serverUrl = import.meta.env.VITE_API_URL || ''

  socket = io(serverUrl, {
    auth:                { token: accessToken },
    transports:          ['websocket'],
    reconnectionAttempts: 8,
    reconnectionDelay:    1000,
    reconnectionDelayMax: 8000,
    timeout:             10000,
  })

  socket.on('connect', () => {
    console.log('[Socket] connected:', socket.id)
  })

  socket.on('reconnect', (attempt) => {
    console.log('[Socket] reconnected after', attempt, 'attempts')
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] connect error:', err.message)
  })

  return socket
}

export const disconnectSocket = () => {
  socket?.disconnect()
  socket = null
}

// ── Room ──────────────────────────────────────────
export const joinRoom  = (eventId) => socket?.emit('chat:join',  { eventId })
export const leaveRoom = (eventId) => socket?.emit('chat:leave', { eventId })

// ── Messages ──────────────────────────────────────
export const sendMessage = (eventId, text, tempId) =>
  socket?.emit('chat:message', { eventId, text, tempId })

// ── Typing ────────────────────────────────────────
export const sendTyping = (eventId, isTyping) =>
  socket?.emit('chat:typing', { eventId, isTyping })

// ── Read receipt ──────────────────────────────────
export const sendRead = (eventId, lastMessageId) =>
  socket?.emit('chat:read', { eventId, lastMessageId })
