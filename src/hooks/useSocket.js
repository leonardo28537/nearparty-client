import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from '@/services/socket'

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore()
  const { addMessage, setOnlineUsers, setTyping } = useChatStore()

  useEffect(() => {
    if (!isAuthenticated()) return

    const socket = connectSocket(accessToken)

    socket.on('chat:message', ({ eventId, message }) => {
      addMessage(eventId, message)
    })

    socket.on('chat:online', ({ eventId, users }) => {
      setOnlineUsers(eventId, users)
    })

    socket.on('chat:typing', ({ eventId, userIds }) => {
      setTyping(eventId, userIds)
    })

    return () => {
      const s = getSocket()
      s?.off('chat:message')
      s?.off('chat:online')
      s?.off('chat:typing')
    }
  }, [accessToken])

  return getSocket()
}
