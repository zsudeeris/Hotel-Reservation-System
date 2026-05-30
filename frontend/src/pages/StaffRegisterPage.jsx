import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function StaffRegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', surname: '', email: '', phone: '', password: '', confirm: '', role: 'HOTEL_MANAGER' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const data = await register({
        name: form.name,
        surname: form.surname,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role
      })
      if (data.error) { setError(data.error); return }
      navigate('/2fa')
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
        BookHotel — Staff Registration
      </div>
      <div className="auth-body">
        <div className="auth-card">
          <h1>Staff Register</h1>
          <p className="auth-sub">Create a staff account for admin or hotel management</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <select value={form.role} onChange={set('role')} style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, color: 'var(--text)', outline: 'none', background: 'var(--white)' }}>
                <option value="HOTEL_MANAGER">Hotel Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field"><input type="text" placeholder="First name" value={form.name} onChange={set('name')} required /></div>
              <div className="field"><input type="text" placeholder="Last name" value={form.surname} onChange={set('surname')} required /></div>
            </div>
            <div className="field"><input type="email" placeholder="Email" value={form.email} onChange={set('email')} required /></div>
            <div className="field"><input type="tel" placeholder="Phone number" value={form.phone} onChange={set('phone')} /></div>
            <div className="field"><input type="password" placeholder="Password" value={form.password} onChange={set('password')} required minLength={6} /></div>
            <div className="field"><input type="password" placeholder="Confirm password" value={form.confirm} onChange={set('confirm')} required /></div>
            {error && <div className="ferr show">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Staff Account'}
            </button>
          </form>
          <div className="auth-switch">
            Already registered? <Link to="/staff/login">Sign in</Link>
          </div>
          <div className="auth-foot">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
