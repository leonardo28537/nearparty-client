import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      loading:      false,
      error:        null,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({
            user:         data.user,
            accessToken:  data.accessToken,
            refreshToken: data.refreshToken,
            loading:      false,
          })
          return { ok: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Error al iniciar sesión'
          set({ loading: false, error: msg })
          return { ok: false, error: msg }
        }
      },

      register: async (payload) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post('/auth/register', payload)
          set({
            user:         data.user,
            accessToken:  data.accessToken,
            refreshToken: data.refreshToken,
            loading:      false,
          })
          return { ok: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Error al registrarse'
          set({ loading: false, error: msg })
          return { ok: false, error: msg }
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null })
      },

      updateProfile: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      name: 'nearparty-auth',
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
