import React from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle, RefreshCw, Home } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'

export default function PaymentFailedPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="confirm-wrap" style={{ paddingTop: 48 }}>
        <div className="confirm-card">
          <div className="confirm-icon fail">
            <XCircle style={{ width: 36, height: 36 }} />
          </div>
          <h2 className="confirm-title">Payment Failed</h2>
          <p className="confirm-sub">We were unable to process your payment.</p>
          <p className="confirm-sub2">Your booking has not been confirmed. Please check your card details and try again.</p>

          <div className="confirm-notice fail-notice">
            <div className="confirm-notice-ico">
              <XCircle style={{ width: 18, height: 18 }} />
            </div>
            <span>No charges were made to your account. Your booking details are still saved.</span>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '18px', marginBottom: 16, fontSize: 13, color: 'var(--sub)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 8 }}>Common reasons for failure:</strong>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>Insufficient funds</li>
              <li>Incorrect card details</li>
              <li>Card expired</li>
              <li>Bank declined the transaction</li>
            </ul>
          </div>

          <div className="confirm-btns">
            <button className="btn-cf-primary" onClick={() => navigate('/payment')}>
              <RefreshCw style={{ width: 16, height: 16 }} />
              Try Again
            </button>
            <button className="btn-cf-outline" onClick={() => navigate('/home')}>
              <Home style={{ width: 16, height: 16 }} />
              Back to Home
            </button>
          </div>
          <button className="confirm-back-link" onClick={() => navigate('/home')}>
            Cancel reservation
          </button>
        </div>
      </div>
    </div>
  )
}
