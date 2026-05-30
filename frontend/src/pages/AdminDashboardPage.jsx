import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Building2, Users, Plus, Trash2, Edit } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Modal from '../components/Modal.jsx'
import { adminGetHotels, adminGetUsers, adminAddHotel, adminDeleteHotel } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'

const EMPTY_HOTEL = { name: '', city: '', country: 'Northern Cyprus', stars: 5, price_per_night: '', description: '', amenities: '' }

export default function AdminDashboardPage() {
  const { showToast } = useToast()
  const [view, setView] = useState('overview')
  const [hotels, setHotels] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newHotel, setNewHotel] = useState(EMPTY_HOTEL)
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    if (view === 'hotels' || view === 'overview') {
      setLoading(true)
      adminGetHotels()
        .then(data => setHotels(Array.isArray(data) ? data : (data.hotels || [])))
        .catch(() => setHotels([]))
        .finally(() => setLoading(false))
    }
    if (view === 'users' || view === 'overview') {
      adminGetUsers()
        .then(data => setUsers(Array.isArray(data) ? data : (data.users || [])))
        .catch(() => setUsers([]))
    }
  }, [view])

  const handleAddHotel = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    try {
      const data = await adminAddHotel(newHotel)
      if (data.error) { showToast('Error: ' + data.error); return }
      setHotels(hs => [...hs, data.hotel || { ...newHotel, id: Date.now() }])
      setNewHotel(EMPTY_HOTEL)
      setShowAddModal(false)
      showToast('Hotel added successfully!')
    } catch {
      showToast('Failed to add hotel.')
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteHotel = async (id) => {
    if (!confirm('Delete this hotel? This cannot be undone.')) return
    try {
      await adminDeleteHotel(id)
      setHotels(hs => hs.filter(h => h.id !== id))
      showToast('Hotel deleted.')
    } catch {
      showToast('Failed to delete hotel.')
    }
  }

  const setHF = (k) => (e) => setNewHotel(h => ({ ...h, [k]: e.target.value }))

  const NAV = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hotels', label: 'Hotels', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">
            <LayoutDashboard style={{ width: 20, height: 20, stroke: 'var(--green)' }} />
            Admin Panel
          </div>
          <nav className="snav">
            {NAV.map(n => (
              <button key={n.id} className={`snav-btn ${view === n.id ? 'active' : ''}`} onClick={() => setView(n.id)}>
                <span className="snav-ico"><n.icon /></span>
                {n.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="dash-main">
          {view === 'overview' && (
            <>
              <div className="dash-main-title">Dashboard Overview</div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-lbl">Total Hotels</div>
                  <div className="stat-val ok">{hotels.length}</div>
                  <div className="stat-change">↑ Active properties</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Total Users</div>
                  <div className="stat-val">{users.length}</div>
                  <div className="stat-change">↑ Registered users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Cities</div>
                  <div className="stat-val">5</div>
                  <div className="stat-change">Kyrenia, Nicosia, Famagusta...</div>
                </div>
              </div>

              <div className="admin-panels">
                <div className="admin-panel">
                  <div className="admin-panel-title">Recent Hotels</div>
                  {hotels.slice(0, 5).map(h => (
                    <div key={h.id} className="admin-hotel-item">
                      <div>
                        <div className="admin-hotel-name">{h.name}</div>
                        <div className="admin-hotel-city">{h.city}</div>
                      </div>
                      <span className="td-badge active">Active</span>
                    </div>
                  ))}
                </div>
                <div className="admin-panel">
                  <div className="admin-panel-title">System Stats</div>
                  {[
                    { label: 'Hotels Listed', val: hotels.length },
                    { label: 'Registered Users', val: users.length },
                    { label: 'Destinations', val: 5 },
                    { label: 'Active Bookings', val: '—' },
                  ].map(s => (
                    <div key={s.label} className="admin-stat-item">
                      <div>
                        <div className="admin-stat-label">{s.label}</div>
                      </div>
                      <div className="admin-stat-val">{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {view === 'hotels' && (
            <>
              <div className="dash-main-title">
                Manage Hotels
                <button className="btn-add" onClick={() => setShowAddModal(true)}>
                  <Plus style={{ width: 14, height: 14, marginRight: 5 }} />
                  Add Hotel
                </button>
              </div>
              <div className="table-card">
                <div className="table-card-head">
                  <span className="table-card-title">All Hotels ({hotels.length})</span>
                </div>
                {loading ? (
                  <div className="page-loading" style={{ minHeight: 200 }}>Loading...</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>City</th>
                        <th>Stars</th>
                        <th>Price/Night</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotels.map(h => (
                        <tr key={h.id}>
                          <td>{h.id}</td>
                          <td style={{ fontWeight: 600 }}>{h.name}</td>
                          <td className="td-loc">{h.city}</td>
                          <td>{'★'.repeat(h.stars || 5)}</td>
                          <td>${h.price_per_night || '—'}</td>
                          <td><span className="td-badge active">Active</span></td>
                          <td>
                            <div className="td-actions">
                              <button className="td-edit"><Edit /></button>
                              <button className="td-del" onClick={() => handleDeleteHotel(h.id)}><Trash2 /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {view === 'users' && (
            <>
              <div className="dash-main-title">Manage Users</div>
              <div className="table-card">
                <div className="table-card-head">
                  <span className="table-card-title">All Users ({users.length})</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td style={{ fontWeight: 600 }}>{u.name} {u.surname}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`td-badge ${u.role === 'ADMIN' ? 'active' : 'pending'}`}>
                            {u.role || 'USER'}
                          </span>
                        </td>
                        <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                        <td><span className="td-badge active">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Hotel">
        <form onSubmit={handleAddHotel}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="form-inp" placeholder="Hotel name *" value={newHotel.name} onChange={setHF('name')} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="form-inp" placeholder="City *" value={newHotel.city} onChange={setHF('city')} required />
              <select className="form-inp" value={newHotel.stars} onChange={setHF('stars')}>
                {[3, 4, 5].map(s => <option key={s} value={s}>{s} Stars</option>)}
              </select>
            </div>
            <input className="form-inp" type="number" placeholder="Price per night ($)" value={newHotel.price_per_night} onChange={setHF('price_per_night')} />
            <textarea
              className="form-inp"
              placeholder="Description"
              value={newHotel.description}
              onChange={setHF('description')}
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <input className="form-inp" placeholder="Amenities (comma-separated)" value={newHotel.amenities} onChange={setHF('amenities')} />
          </div>
          {addLoading && <div style={{ color: 'var(--sub)', fontSize: 13, marginTop: 12 }}>Adding hotel...</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" className="btn-add" disabled={addLoading} style={{ flex: 1, padding: 12 }}>
              Add Hotel
            </button>
            <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: 12, border: '1.5px solid var(--border)', borderRadius: 9, background: 'var(--white)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
