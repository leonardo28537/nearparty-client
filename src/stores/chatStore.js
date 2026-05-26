import { create } from 'zustand'
import api from '@/services/api'

export const useChatStore = create((set, get) => ({
  rooms:         {}, // { [eventId]: Message[] }
  activeRoom:    null,
  onlineUsers:   {}, // { [eventId]: userId[] }
  typing:        {}, // { [eventId]: userId[] }

  setActiveRoom: (eventId) => set({ activeRoom: eventId }),

  loadHistory: async (eventId) => {
    try {
      const { data } = await api.get(`/chat/${eventId}/messages`)
      set((state) => ({
        rooms: { ...state.rooms, [eventId]: data.messages },
      }))
    } catch (err) {
      console.error('Chat history error:', err)
    }
  },

  addMessage: (eventId, message) =>
    set((state) => ({
      rooms: {
        ...state.rooms,
        [eventId]: [...(state.rooms[eventId] || []), message],
      },
    })),

  setOnlineUsers: (eventId, users) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [eventId]: users },
    })),

  setTyping: (eventId, userIds) =>
    set((state) => ({
      typing: { ...state.typing, [eventId]: userIds },
    })),

  clearRoom: (eventId) =>
    set((state) => {
      const rooms = { ...state.rooms }
      delete rooms[eventId]
      return { rooms }
    }),
}))
