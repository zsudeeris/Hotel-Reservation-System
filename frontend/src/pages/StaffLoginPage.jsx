import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, ChevronDown, Check, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const DEMO_STAFF = {
  ADMIN: { email: 'admin@bookhotel.com', password: 'Admin123!' },
  HOTEL_MANAGER: { email: 'manager@bookhotel.com', password: 'Manager123!' },
}

export default function StaffLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const rootRef = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const demo = DEMO_STAFF[role] || DEMO_STAFF.ADMIN
  const roleOptions = useMemo(() => ([
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'HOTEL_MANAGER', label: 'Hotel Manager' },
  ]), [])

  useEffect(() => {
    const onDocMouseDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  const selectRole = (nextRole) => {
    setRole(nextRole)
    setOpen(false)
    setFocusIndex(roleOptions.findIndex(option => option.value === nextRole))
  }

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
      setFocusIndex(roleOptions.findIndex(option => option.value === role))
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setFocusIndex(prev => Math.min(roleOptions.length - 1, prev + 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setFocusIndex(prev => Math.max(0, prev - 1))
    }
  }

  const handleMenuKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIndex(prev => Math.min(roleOptions.length - 1, prev + 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIndex(prev => Math.max(0, prev - 1))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      selectRole(roleOptions[focusIndex]?.value || roleOptions[0].value)
    }
  }

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
          <div className="demo-auth-box" style={{ marginBottom: 16 }}>
            <div className="demo-auth-title">Demo Staff Credentials</div>
            <div className="demo-auth-row"><span>Role</span><code>{role === 'ADMIN' ? 'Administrator' : 'Hotel Manager'}</code></div>
            <div className="demo-auth-row"><span>Email</span><code>{demo.email}</code></div>
            <div className="demo-auth-row"><span>Password</span><code>{demo.password}</code></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field role-dropdown-wrap" ref={rootRef}>
              <button
                type="button"
                className={`role-dropdown-trigger ${open ? 'open' : ''}`}
                onClick={() => setOpen(value => !value)}
                onKeyDown={handleTriggerKeyDown}
                aria-haspopup="listbox"
                aria-expanded={open}
              >
                <span>{roleOptions.find(option => option.value === role)?.label || 'Select role'}</span>
                <ChevronDown style={{ width: 16, height: 16, flexShrink: 0 }} />
              </button>
              {open && (
                <div className="role-dropdown-menu" role="listbox" tabIndex={-1} onKeyDown={handleMenuKeyDown}>
                  {roleOptions.map((option, index) => {
                    const active = option.value === role
                    const focused = index === focusIndex
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`role-dropdown-option${active ? ' selected' : ''}${focused ? ' focused' : ''}`}
                        onMouseEnter={() => setFocusIndex(index)}
                        onClick={() => selectRole(option.value)}
                      >
                        <span>{option.label}</span>
                        {active && <Check style={{ width: 14, height: 14 }} />}
                      </button>
                    )
                  })}
                </div>
              )}
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
