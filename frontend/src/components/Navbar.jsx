import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Home, Heart, Calendar, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/home" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Building2 className="logo-ico" style={{ stroke: 'var(--green)' }} />
        BookHotel
      </Link>
      <div className="nav-links">
        <Link to="/home"><Home className="nav-ico" />Home</Link>
        <Link to="/wishlist"><Heart className="nav-ico" />Wishlist</Link>
        <Link to="/reservations"><Calendar className="nav-ico" />My Reservations</Link>
        <Link to="/profile"><User className="nav-ico" />Profile</Link>
        {user?.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
        {(user?.role === 'HOTEL_MANAGER' || user?.role === 'ADMIN') && <Link to="/manager">Manager</Link>}
      </div>
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
