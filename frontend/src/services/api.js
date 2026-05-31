const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const apiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) return path
  if (!API_BASE_URL) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

const requestJSON = (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  return fetch(apiUrl(url), {
    ...options,
    credentials: 'include',
    signal: controller.signal,
  })
    .then(async (r) => {
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        const error = new Error(data?.message || data?.error || `Request failed with status ${r.status}`)
        error.status = r.status
        error.data = data
        throw error
      }
      return data
    })
    .finally(() => clearTimeout(timer))
}

const postJSON = (url, data, method = 'POST') =>
  requestJSON(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

// Hotels
export const getHotels = () => requestJSON('/api/hotels')
export const searchHotels = (params) => requestJSON('/api/hotels/search?' + new URLSearchParams(params))
export const getHotel = (id) => requestJSON('/api/hotels/' + id)
export const getHotelRooms = (id, params = {}) => requestJSON('/api/hotels/' + id + '/rooms?' + new URLSearchParams(params))
export const getHotelReviews = (id) => requestJSON('/api/hotels/' + id + '/reviews')

// Auth
export const login = (data) => postJSON('/api/login', data)
export const register = (data) => postJSON('/api/register', data)
export const verify2FA = (code) => postJSON('/api/verify-2fa', { code })
export const resend2FA = () => requestJSON('/api/resend-2fa', { method: 'POST' })
export const logout = () => requestJSON('/api/logout', { method: 'POST' })
export const getMe = () => requestJSON('/api/me')

// Reservations
export const createReservation = (data) => postJSON('/api/reservations', data)
export const getReservations = () => requestJSON('/api/reservations')
export const cancelReservation = (id) => requestJSON('/api/reservations/' + id + '/cancel', { method: 'POST' })
export const deleteReservation = (id) => requestJSON('/api/reservations/' + id, { method: 'DELETE' })

// Payment
export const processPayment = (data) => postJSON('/api/payments', data)

// Profile
export const getProfile = () => requestJSON('/api/me')
export const updateProfile = (data) => postJSON('/api/profile', data, 'PUT')
export const changePassword = (data) => postJSON('/api/change-password', data)

// Reviews
export const addReview = (data) => postJSON('/api/reviews', data)

// Admin
export const adminGetHotels = () => requestJSON('/api/admin/hotels')
export const adminAddHotel = (data) => postJSON('/api/admin/hotels', data)
export const adminDeleteHotel = (id) => requestJSON('/api/admin/hotels/' + id, { method: 'DELETE' })
export const adminGetUsers = () => requestJSON('/api/admin/users')

// Manager
export const managerGetStats = () => requestJSON('/api/manager/stats')
export const managerGetReservations = () => requestJSON('/api/manager/reservations')

// Chatbot
export const sendChatMessage = (message) => postJSON('/api/chatbot', { message })
export const getChatbotStatus = () => requestJSON('/api/chatbot/status')
