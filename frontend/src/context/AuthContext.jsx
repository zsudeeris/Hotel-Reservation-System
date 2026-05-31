import React, { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../services/api.js'
import { clearStoredReturnTo } from '../utils/authRedirect.js'

const AuthContext = createContext(null)

function normalizeUser(user) {
  if (!user) return null
  const hotelId = user.hotelId ?? user.hotel_id ?? null
  const hotelName = user.hotelName ?? user.hotel_name ?? null
  return {
    ...user,
    hotelId,
    hotel_id: hotelId,
    hotelName,
    hotel_name: hotelName,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingEmail, setPendingEmail] = useState(null)
  const [pendingCode, setPendingCode] = useState(null)
  const [pendingRole, setPendingRole] = useState(null)
  const [pendingAuthMode, setPendingAuthMode] = useState(null)

  useEffect(() => {
    api.getMe()
      .then(data => {
        // /api/me returns { authenticated: bool, user: {...} }
        if (data?.authenticated && data.user) setUser(normalizeUser(data.user))
        else setUser(null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password, roleHint) => {
    const data = await api.login({ email, password, role_hint: roleHint })
    if (data?.success && data.debug_code) {
      setPendingEmail(email)
      setPendingCode(data.debug_code || null)
      setPendingRole(data.role || roleHint || null)
      setPendingAuthMode(roleHint ? 'staff' : 'customer')
    }
    return data
  }

  const verify2FA = async (code) => {
    // /api/verify-2fa returns { success, role, name }
    const data = await api.verify2FA(code)
    if (data?.success) {
      // Fetch full user object from /api/me after successful 2FA
      const me = await api.getMe()
      if (me?.authenticated && me.user) setUser(normalizeUser(me.user))
      setPendingEmail(null)
      setPendingCode(null)
      setPendingRole(null)
      setPendingAuthMode(null)
    }
    return data
  }

  const register = async (formData) => {
    const data = await api.register(formData)
    if (data?.success && data.debug_code) {
      setPendingEmail(formData.email)
      setPendingCode(data.debug_code || null)
      setPendingRole(data.role || formData.role || null)
      setPendingAuthMode(formData.role && formData.role !== 'USER' ? 'staff' : 'customer')
    }
    return data
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
    setPendingEmail(null)
    setPendingCode(null)
    setPendingRole(null)
    setPendingAuthMode(null)
    clearStoredReturnTo()
  }

  return (
      <AuthContext.Provider value={{ user, loading, pendingEmail, pendingCode, pendingRole, pendingAuthMode, setPendingCode, setPendingRole, setPendingAuthMode, login, verify2FA, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
