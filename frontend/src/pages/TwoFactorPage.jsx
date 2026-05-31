import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { resend2FA } from '../services/api.js'

export default function TwoFactorPage() {
  const navigate = useNavigate()
  const { verify2FA, pendingEmail, pendingCode, setPendingCode } = useAuth()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [timer, setTimer] = useState(300)
  const inputs = useRef([])

  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  const handleInput = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = digit
    setCode(next)
    if (digit && idx < 5) inputs.current[idx + 1]?.focus()
    if (!digit && idx > 0) inputs.current[idx - 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length < 6) { setError('Please enter all 6 digits.'); return }
    setError('')
    setLoading(true)
    try {
      const data = await verify2FA(fullCode)
      if (!data.success) { setError(data.message || 'Invalid or expired code.'); return }
      // After verify2FA, AuthContext fetches /api/me and sets user
      // Route by role returned in verify response
      if (data.role === 'ADMIN') navigate('/admin')
      else if (data.role === 'HOTEL_MANAGER') navigate('/manager')
      else navigate('/home')
    } catch {
      setError('Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const data = await resend2FA()
      setPendingCode(data?.debug_code || null)
      setTimer(data?.expires_in || 300)
      setCode(['', '', '', '', '', ''])
      setError('')
    } catch {
      setError('Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  const mins = Math.floor(timer / 60)
  const secs = timer % 60

  return (
    <div className="auth-wrap">
      <div className="auth-bar">
        <Shield style={{ width: 16, height: 16 }} />
        BookHotel — Two-Factor Authentication
      </div>
      <div className="auth-body">
        <div className="auth-card">
          <h1>Verify Your Identity</h1>
          <p className="twofa-sub">
            Demo mode only. Use the code shown below to continue.<br />
            <strong>{pendingEmail || 'your email'}</strong>
          </p>
          <div className="demo-auth-box demo-twofa-box">
            <div className="demo-auth-title">Demo 2FA Code</div>
            <div className="demo-auth-row">
              <span>Code</span>
              <code>{pendingCode || '------'}</code>
            </div>
            <div className="demo-auth-note">Demo only: showing 2FA code on screen. Do not use in production.</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }} onPaste={handlePaste}>
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleInput(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  style={{
                    width: 52, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 700,
                    border: `2px solid ${digit ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 10, outline: 'none', background: 'var(--white)',
                    transition: 'border-color .2s'
                  }}
                />
              ))}
            </div>
            {error && <div className="ferr show" style={{ textAlign: 'center', marginBottom: 10 }}>{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="twofa-timer">
            {timer > 0
              ? <>Code expires in <b>{mins}:{secs.toString().padStart(2, '0')}</b></>
              : <span style={{ color: 'var(--red)' }}>Code expired</span>
            }
          </div>

          <div className="twofa-resend">
            Didn't receive the code?
            <a
              onClick={timer === 0 || !resending ? handleResend : undefined}
              style={{ cursor: timer === 0 ? 'pointer' : 'default', opacity: timer > 0 ? 0.5 : 1 }}
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
