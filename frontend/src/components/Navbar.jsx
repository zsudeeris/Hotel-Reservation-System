import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Home, Heart, Calendar, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar({ staffMeta = null }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isStaff = user?.role === 'ADMIN' || user?.role === 'HOTEL_MANAGER'
  const dashboardPath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'HOTEL_MANAGER' ? '/manager' : '/home'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to={dashboardPath} className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Building2 className="logo-ico" style={{ stroke: 'var(--green)' }} />
        BookHotel
      </Link>
      {isStaff ? (
        <div className="nav-staff-meta">
          <span className="nav-role-pill">
            {staffMeta?.roleLabel || (user?.role === 'ADMIN' ? 'Administrator' : 'Hotel Manager')}
          </span>
          {user?.role === 'HOTEL_MANAGER' && (
            <span className="nav-hotel-pill">
              {staffMeta?.hotelName || staffMeta?.hotel_name || user?.hotel_name || user?.hotelName || 'Assigned Hotel'}
            </span>
          )}
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/home"><Home className="nav-ico" />Home</Link>
          <Link to="/wishlist"><Heart className="nav-ico" />Wishlist</Link>
          <Link to="/reservations"><Calendar className="nav-ico" />My Reservations</Link>
          <Link to="/profile"><User className="nav-ico" />Profile</Link>
        </div>
      )}
      <div className="nav-right">
        {user && (
          <span style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 500 }}>
            {user.name || user.email}
          </span>
        )}
        <button className="nav-logout" onClick={handleLogout}>
          <LogOut style={{ width: 14, height: 14, marginRight: 5 }} />
          Logout
        </button>
      </div>
    </nav>
  )
}
