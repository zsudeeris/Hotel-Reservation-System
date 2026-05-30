const postJSON = (url, data, method = 'POST') =>
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json())

// Hotels
export const getHotels = () => fetch('/api/hotels').then(r => r.json())
export const searchHotels = (params) => fetch('/api/hotels/search?' + new URLSearchParams(params)).then(r => r.json())
export const getHotel = (id) => fetch('/api/hotels/' + id).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })

// Auth
export const login = (data) => postJSON('/api/login', data)
export const register = (data) => postJSON('/api/register', data)
export const verify2FA = (code) => postJSON('/api/verify-2fa', { code })
export const resend2FA = () => fetch('/api/resend-2fa', { method: 'POST' }).then(r => r.json())
export const logout = () => fetch('/api/logout', { method: 'POST' }).then(r => r.json())
export const getMe = () => fetch('/api/me').then(r => r.json())

// Reservations
export const createReservation = (data) => postJSON('/api/reservations', data)
export const getReservations = () => fetch('/api/reservations').then(r => r.json())
export const cancelReservation = (id) => fetch('/api/reservations/' + id + '/cancel', { method: 'POST' }).then(r => r.json())

// Payment
export const processPayment = (data) => postJSON('/api/payments', data)

// Profile
export const getProfile = () => fetch('/api/me').then(r => r.json())
export const updateProfile = (data) => postJSON('/api/profile', data, 'PUT')
export const changePassword = (data) => postJSON('/api/change-password', data)

// Reviews
export const addReview = (data) => postJSON('/api/reviews', data)

// Admin
export const adminGetHotels = () => fetch('/api/admin/hotels').then(r => r.json())
export const adminAddHotel = (data) => postJSON('/api/admin/hotels', data)
export const adminDeleteHotel = (id) => fetch('/api/admin/hotels/' + id, { method: 'DELETE' }).then(r => r.json())
export const adminGetUsers = () => fetch('/api/admin/users').then(r => r.json())

// Manager
export const managerGetStats = () => fetch('/api/manager/stats').then(r => r.json())
export const managerGetReservations = () => fetch('/api/manager/reservations').then(r => r.json())

// Chatbot
export const sendChatMessage = (message) => postJSON('/api/chatbot', { message })
export const getChatbotStatus = () => fetch('/api/chatbot/status').then(r => r.json())
