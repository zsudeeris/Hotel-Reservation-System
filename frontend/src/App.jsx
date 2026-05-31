import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import Toast from './components/Toast.jsx'

import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import TwoFactorPage from './pages/TwoFactorPage.jsx'
import StaffLoginPage from './pages/StaffLoginPage.jsx'
import StaffRegisterPage from './pages/StaffRegisterPage.jsx'
import HomePage from './pages/HomePage.jsx'
import SearchResultsPage from './pages/SearchResultsPage.jsx'
import HotelDetailPage from './pages/HotelDetailPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import PaymentPage from './pages/PaymentPage.jsx'
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx'
import PaymentFailedPage from './pages/PaymentFailedPage.jsx'
import WishlistPage from './pages/WishlistPage.jsx'
import MyReservationsPage from './pages/MyReservationsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import ManagerDashboardPage from './pages/ManagerDashboardPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireRole({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/home" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
    if (user.role === 'HOTEL_MANAGER') return <Navigate to="/manager" replace />
    return <Navigate to="/home" replace />
  }
  if (loading) return children
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/2fa" element={<TwoFactorPage />} />
      <Route path="/staff/login" element={<StaffLoginPage />} />
      <Route path="/staff/register" element={<StaffRegisterPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/hotels/:id" element={<HotelDetailPage />} />

      {/* Auth required */}
      <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
      <Route path="/booking" element={<RequireAuth><BookingPage /></RequireAuth>} />
      <Route path="/payment" element={<RequireAuth><PaymentPage /></RequireAuth>} />
      <Route path="/booking/success" element={<RequireAuth><PaymentSuccessPage /></RequireAuth>} />
      <Route path="/booking/failed" element={<RequireAuth><PaymentFailedPage /></RequireAuth>} />
      <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
      <Route path="/reservations" element={<RequireAuth><MyReservationsPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

      {/* Role restricted */}
      <Route path="/admin" element={<RequireRole roles={['ADMIN']}><AdminDashboardPage /></RequireRole>} />
      <Route path="/manager" element={<RequireRole roles={['HOTEL_MANAGER', 'ADMIN']}><ManagerDashboardPage /></RequireRole>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <BookingProvider>
            <AppErrorBoundary>
              <AppRoutes />
            </AppErrorBoundary>
            <Toast />
          </BookingProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
