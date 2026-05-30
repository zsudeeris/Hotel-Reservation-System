import React, { useState } from 'react'
import { User, Lock, Save } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { updateProfile, changePassword } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const { showToast } = useToast()

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nationality: user?.nationality || '',
    birthDate: user?.birth_date || ''
  })

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [pwError, setPwError] = useState('')
  const [activeTab, setActiveTab] = useState('info')

  const setField = (k) => (e) => setProfileForm(f => ({ ...f, [k]: e.target.value }))
  const setPwField = (k) => (e) => setPwForm(f => ({ ...f, [k]: e.target.value }))

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileLoading(true)
    try {
      const data = await updateProfile(profileForm)
      if (data.error) { setProfileError(data.error); return }
      setUser(u => ({ ...u, ...profileForm }))
      showToast('Profile updated successfully!')
    } catch {
      setProfileError('Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    if (pwForm.newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return }
    setPwLoading(true)
    try {
      const data = await changePassword({ current_password: pwForm.current, new_password: pwForm.newPw })
      if (data.error) { setPwError(data.error); return }
      setPwForm({ current: '', newPw: '', confirm: '' })
      showToast('Password changed successfully!')
    } catch {
      setPwError('Failed to change password.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: 26, height: 26, stroke: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{user?.name} {user?.surname}</h1>
            <p style={{ color: 'var(--sub)', fontSize: 13, margin: '4px 0 0' }}>{user?.email}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('info')}
            style={{ padding: '10px 20px', borderRadius: 9, border: '1.5px solid', borderColor: activeTab === 'info' ? 'var(--green)' : 'var(--border)', background: activeTab === 'info' ? 'var(--green)' : 'var(--white)', color: activeTab === 'info' ? '#fff' : 'var(--sub)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            <User style={{ width: 14, height: 14, marginRight: 6 }} />
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{ padding: '10px 20px', borderRadius: 9, border: '1.5px solid', borderColor: activeTab === 'password' ? 'var(--green)' : 'var(--border)', background: activeTab === 'password' ? 'var(--green)' : 'var(--white)', color: activeTab === 'password' ? '#fff' : 'var(--sub)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            <Lock style={{ width: 14, height: 14, marginRight: 6 }} />
            Change Password
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="bcard">
            <div className="bcard-title" style={{ marginBottom: 20 }}>Personal Information</div>
            <form onSubmit={handleProfileSave}>
              <div className="form-grid">
                <input className="form-inp" placeholder="First name" value={profileForm.name} onChange={setField('name')} />
                <input className="form-inp" placeholder="Last name" value={profileForm.surname} onChange={setField('surname')} />
                <input className="form-inp" type="email" placeholder="Email" value={profileForm.email} onChange={setField('email')} />
                <input className="form-inp" type="tel" placeholder="Phone" value={profileForm.phone} onChange={setField('phone')} />
                <input className="form-inp" placeholder="Nationality" value={profileForm.nationality} onChange={setField('nationality')} />
                <input className="form-inp" type="date" placeholder="Date of birth" value={profileForm.birthDate} onChange={setField('birthDate')} />
              </div>
              {profileError && <div className="ferr show">{profileError}</div>}
              <button type="submit" className="btn-proceed" style={{ marginTop: 20 }} disabled={profileLoading}>
                <Save style={{ width: 16, height: 16 }} />
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="bcard">
            <div className="bcard-title" style={{ marginBottom: 20 }}>Change Password</div>
            <form onSubmit={handlePasswordChange}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input className="form-inp" type="password" placeholder="Current password" value={pwForm.current} onChange={setPwField('current')} required />
                <input className="form-inp" type="password" placeholder="New password (min 6 chars)" value={pwForm.newPw} onChange={setPwField('newPw')} required minLength={6} />
                <input className="form-inp" type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={setPwField('confirm')} required />
              </div>
              {pwError && <div className="ferr show">{pwError}</div>}
              <button type="submit" className="btn-proceed" style={{ marginTop: 20 }} disabled={pwLoading}>
                <Lock style={{ width: 16, height: 16 }} />
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
