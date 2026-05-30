import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 96, fontFamily: 'var(--serif)', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginTop: 8, marginBottom: 12 }}>Page Not Found</h1>
        <p style={{ fontSize: 16, color: 'var(--sub)', lineHeight: 1.7, marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to exploring amazing hotels in Northern Cyprus.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn-cf-primary"
            style={{ flex: 'none', padding: '13px 28px' }}
            onClick={() => navigate('/')}
          >
            <Home style={{ width: 16, height: 16 }} />
            Go Home
          </button>
          <button
            className="btn-cf-outline"
            style={{ flex: 'none', padding: '13px 28px' }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
