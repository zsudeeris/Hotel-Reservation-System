import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="lfooter">
      <div className="lfooter-inner">
        <div>
          <div className="lfooter-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 style={{ width: 20, height: 20, stroke: '#fff' }} />
            BookHotel
          </div>
          <p className="lfooter-desc">
            Your trusted partner for premium hotel reservations in Northern Cyprus.
            Luxury, comfort and memorable experiences await.
          </p>
        </div>
        <div className="lfooter-col">
          <span className="lfooter-col-title">Company</span>
          <a onClick={() => navigate('/')}>About Us</a>
          <a onClick={() => navigate('/')}>Careers</a>
          <a onClick={() => navigate('/')}>Press</a>
          <a onClick={() => navigate('/')}>Blog</a>
        </div>
        <div className="lfooter-col">
          <span className="lfooter-col-title">Support</span>
          <a onClick={() => navigate('/')}>Help Center</a>
          <a onClick={() => navigate('/')}>Contact Us</a>
          <a onClick={() => navigate('/')}>Privacy Policy</a>
          <a onClick={() => navigate('/')}>Terms of Service</a>
        </div>
        <div className="lfooter-col">
          <span className="lfooter-col-title">Account</span>
          <a onClick={() => navigate('/login')}>Sign In</a>
          <a onClick={() => navigate('/register')}>Register</a>
          <a onClick={() => navigate('/reservations')}>My Reservations</a>
          <a onClick={() => navigate('/wishlist')}>Wishlist</a>
        </div>
      </div>
      <div className="lfooter-bottom">
        © {new Date().getFullYear()} BookHotel. All rights reserved. Built with love for travelers.
      </div>
    </footer>
  )
}
