import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) { navigate('/home'); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      // Flask returns { success: true, debug_code } on success, { success: false, message } on fail
      if (data.success) {
        navigate('/2fa')
      } else {
        setError(data.message || 'Invalid email or password.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-bar">
        <Building2 style={{ width: 16, height: 16 }} />
        BookHotel — Secure Login
      </div>
      <div className="auth-body">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p className="auth-sub">Sign in to access your bookings and exclusive deals</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={error ? 'err' : ''}
              />
            </div>
            <div className="field" style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={error ? 'err' : ''}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
              >
                {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
            {error && <div className="ferr show">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="auth-switch">
            Don't have an account?<Link to="/register">Register free</Link>
          </div>
          <div className="auth-foot">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
