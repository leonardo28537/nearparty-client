import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Attach access token ──────────────────────────
api.interceptors.request.use((config) => {
  // Import dynamically to avoid circular dep
  const raw = localStorage.getItem('nearparty-auth')
  if (raw) {
    const { state } = JSON.parse(raw)
    if (state?.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`
    }
  }
  return config
})

// ─── Refresh token on 401 ─────────────────────────
let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((e) => Promise.reject(e))
      }

      original._retry = true
      isRefreshing = true

      const raw = localStorage.getItem('nearparty-auth')
      const refreshToken = raw ? JSON.parse(raw).state?.refreshToken : null

      if (!refreshToken) {
        isRefreshing = false
        // Clear auth state — user must log in again
        localStorage.removeItem('nearparty-auth')
        window.location.href = '/login'
        return Promise.reject(err)
      }

      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        const { accessToken } = data

        // Patch stored tokens
        const stored = JSON.parse(localStorage.getItem('nearparty-auth'))
        stored.state.accessToken = accessToken
        localStorage.setItem('nearparty-auth', JSON.stringify(stored))

        original.headers.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('nearparty-auth')
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export default api
