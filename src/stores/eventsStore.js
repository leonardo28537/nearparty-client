import { create } from 'zustand'
import api from '@/services/api'

export const useEventsStore = create((set, get) => ({
  events:        [],
  nearbyEvents:  [],
  activeEvent:   null,
  loading:       false,
  error:         null,
  radius:        5000, // metres

  setRadius: (radius) => set({ radius }),

  fetchNearby: async (lat, lng) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/events/nearby', {
        params: { lat, lng, radius: get().radius },
      })
      set({ nearbyEvents: data.events, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false })
    }
  },

  fetchById: async (id) => {
    set({ loading: true })
    try {
      const { data } = await api.get(`/events/${id}`)
      set({ activeEvent: data.event, loading: false })
      return data.event
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false })
    }
  },

  createEvent: async (payload) => {
    try {
      const { data } = await api.post('/events', payload)
      set((state) => ({ events: [data.event, ...state.events] }))
      return { ok: true, event: data.event }
    } catch (err) {
      return { ok: false, error: err.response?.data?.message }
    }
  },

  applyToEvent: async (eventId) => {
    try {
      const { data } = await api.post(`/events/${eventId}/apply`)
      return { ok: true, application: data.application }
    } catch (err) {
      return { ok: false, error: err.response?.data?.message }
    }
  },

  updateApplicationStatus: async (eventId, applicationId, status) => {
    try {
      await api.patch(`/events/${eventId}/applications/${applicationId}`, { status })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.response?.data?.message }
    }
  },

  clearActive: () => set({ activeEvent: null }),
}))
