import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', surname: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const data = await register({
        name: form.name,
        surname: form.surname,
        email: form.email,
        phone: form.phone,
        password: form.password
      })
      if (data.success) {
        navigate('/2fa')
      } else {
        setError(data.message || 'Registration failed. Please try again.')
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
        BookHotel — Create Account
      </div>
      <div className="auth-body">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p className="auth-sub">Join thousands of travelers discovering Northern Cyprus</p>
          <div className="demo-auth-box">
            <div className="demo-auth-title">Demo credentials</div>
            <div className="demo-auth-row"><span>Email</span><code>demo@bookhotel.com</code></div>
            <div className="demo-auth-row"><span>Password</span><code>Demo123!</code></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field">
                <input type="text" placeholder="First name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="field">
                <input type="text" placeholder="Last name" value={form.surname} onChange={set('surname')} required />
              </div>
            </div>
            <div className="field">
              <input type="email" placeholder="Email address" value={form.email} onChange={set('email')} required />
            </div>
            <div className="field">
              <input type="tel" placeholder="Phone number (optional)" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="field">
              <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div className="field">
              <input type="password" placeholder="Confirm password" value={form.confirm} onChange={set('confirm')} required />
            </div>
            {error && <div className="ferr show">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-switch">
            Already have an account?<Link to="/login">Sign in</Link>
          </div>
          <div className="auth-foot">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
