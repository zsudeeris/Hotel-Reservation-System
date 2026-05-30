import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export default function LandingNavbar() {
  const navigate = useNavigate()
  return (
    <nav className="lnav">
      <div className="lnav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <Building2 className="logo-ico" style={{ stroke: '#fff' }} />
        BookHotel
      </div>
      <div className="lnav-links">
        <a onClick={() => navigate('/search')} style={{ cursor: 'pointer' }}>Hotels</a>
        <a onClick={() => navigate('/#why-us')} style={{ cursor: 'pointer' }}>Why Us</a>
      </div>
      <div className="lnav-right">
        <button className="lnav-signin" onClick={() => navigate('/login')}>Sign In</button>
        <button className="lnav-register" onClick={() => navigate('/register')}>Register</button>
        <button className="lnav-admin" onClick={() => navigate('/staff/login')}>Staff Portal</button>
      </div>
    </nav>
  )
}
