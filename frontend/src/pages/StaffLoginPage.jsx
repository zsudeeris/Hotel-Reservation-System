import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function StaffLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password, role)
      if (data.success) {
        navigate('/2fa')
      } else {
        setError(data.message || 'Invalid credentials or insufficient role.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-bar" style={{ background: '#1a202c' }}>
        <Shield style={{ width: 16, height: 16 }} />
        BookHotel — Staff Portal
      </div>
      <div className="auth-body">
        <div className="auth-card">
          <h1>Staff Login</h1>
          <p className="auth-sub">Access the administration and management dashboard</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, color: 'var(--text)', outline: 'none', background: 'var(--white)' }}
              >
                <option value="ADMIN">Administrator</option>
                <option value="HOTEL_MANAGER">Hotel Manager</option>
              </select>
            </div>
            <div className="field">
              <input type="email" placeholder="Staff email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="ferr show">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Staff Sign In'}
            </button>
          </form>
          <div className="auth-switch">
            Need a staff account? <Link to="/staff/register">Register here</Link>
          </div>
          <div className="auth-foot">
            <Link to="/">← Back to Home</Link>
            &nbsp;·&nbsp;
            <Link to="/login">Guest Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
