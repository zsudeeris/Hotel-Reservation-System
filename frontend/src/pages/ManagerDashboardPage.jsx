import React, { useState, useEffect } from 'react'
import { LayoutDashboard, BedDouble, Image, BarChart2, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { managerGetStats, managerGetReservations } from '../services/api.js'

const MOCK_CHART_DATA = [
  { month: 'Jan', bookings: 42, revenue: 8400 },
  { month: 'Feb', bookings: 58, revenue: 11600 },
  { month: 'Mar', bookings: 71, revenue: 14200 },
  { month: 'Apr', bookings: 65, revenue: 13000 },
  { month: 'May', bookings: 83, revenue: 16600 },
  { month: 'Jun', bookings: 94, revenue: 18800 },
]

const MOCK_ROOMS = [
  { id: 1, name: 'Deluxe Sea View', count: 12, price: 185, available: 8, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80' },
  { id: 2, name: 'Standard Room', count: 24, price: 120, available: 15, image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=300&q=80' },
  { id: 3, name: 'Junior Suite', count: 8, price: 245, available: 3, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&q=80' },
  { id: 4, name: 'Penthouse Suite', count: 2, price: 450, available: 1, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=300&q=80' },
  { id: 5, name: 'Family Room', count: 10, price: 165, available: 6, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=80' },
  { id: 6, name: 'Economy Room', count: 20, price: 85, available: 12, image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=300&q=80' },
]

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80',
]

export default function ManagerDashboardPage() {
  const [view, setView] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    managerGetStats()
      .then(data => setStats(data))
      .catch(() => setStats({ total_reservations: 156, revenue: 28900, occupancy: 73, avg_rating: 8.7 }))

    managerGetReservations()
      .then(data => setReservations(Array.isArray(data) ? data : (data.reservations || [])))
      .catch(() => setReservations([]))
  }, [])

  const displayStats = stats || { total_reservations: 156, revenue: 28900, occupancy: 73, avg_rating: 8.7 }
  const maxBookings = Math.max(...MOCK_CHART_DATA.map(d => d.bookings))

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms', icon: BedDouble },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">
            <LayoutDashboard style={{ width: 20, height: 20, stroke: 'var(--green)' }} />
            Manager
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
          {view === 'dashboard' && (
            <>
              <div className="dash-main-title">Hotel Dashboard</div>
              <div className="stats-grid-4">
                <div className="stat-card">
                  <div className="stat-lbl">Total Reservations</div>
                  <div className="stat-val ok">{displayStats.total_reservations}</div>
                  <div className="stat-change">↑ This month</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Revenue</div>
                  <div className="stat-val">${(displayStats.revenue || 0).toLocaleString()}</div>
                  <div className="stat-change">↑ This month</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Occupancy Rate</div>
                  <div className="stat-val">{displayStats.occupancy || 73}%</div>
                  <div className="stat-change">↑ Current</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Avg. Rating</div>
                  <div className="stat-val ok">{displayStats.avg_rating || '8.7'}</div>
                  <div className="stat-change">Guest score</div>
                </div>
              </div>

              <div className="activity-card">
                <div className="activity-title">Recent Reservations</div>
                {reservations.length > 0 ? (
                  reservations.slice(0, 6).map((r, i) => (
                    <div key={r.id || i} className="activity-item">
                      <div>
                        <div className="act-title">Reservation #{r.id}</div>
                        <div className="act-sub">{r.guest_name || 'Guest'} · {r.room_type || 'Room'}</div>
                      </div>
                      <span className={`td-badge ${r.status === 'confirmed' ? 'active' : 'pending'}`}>
                        {r.status || 'pending'}
                      </span>
                    </div>
                  ))
                ) : (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="activity-item">
                      <div>
                        <div className="act-title">Reservation #{1000 + i}</div>
                        <div className="act-sub">Guest · Deluxe Room · {i + 1} nights</div>
                      </div>
                      <span className="td-badge active">confirmed</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {view === 'rooms' && (
            <>
              <div className="dash-main-title">Room Management</div>
              <div className="rooms-grid">
                {MOCK_ROOMS.map(room => (
                  <div key={room.id} className="rm-card">
                    <img src={room.image} alt={room.name} className="rm-img" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80' }} />
                    <div className="rm-card-top">
                      <div>
                        <div className="rm-card-name">{room.name}</div>
                        <div className="rm-card-count">{room.count} rooms total · {room.available} available</div>
                      </div>
                      <span className={`rm-badge ${room.available > 0 ? 'avail' : 'unavail'}`}>
                        {room.available > 0 ? 'Available' : 'Full'}
                      </span>
                    </div>
                    <div className="rm-price">${room.price} <span className="per">/night</span></div>
                    <div className="rm-actions">
                      <button className="rm-action">Edit</button>
                      <button className="rm-action del">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'media' && (
            <>
              <div className="dash-main-title">Hotel Media</div>
              <div className="drop-zone">
                <div className="drop-ico">📷</div>
                <div className="drop-title">Upload Hotel Photos</div>
                <div className="drop-sub">Drag & drop images here, or click to select files</div>
              </div>
              <div className="media-grid">
                {MOCK_IMAGES.map((img, i) => (
                  <img key={i} src={img} alt={`Hotel ${i + 1}`} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80' }} />
                ))}
              </div>
            </>
          )}

          {view === 'analytics' && (
            <>
              <div className="dash-main-title">Analytics</div>
              <div className="chart-card">
                <div className="chart-card-title">Monthly Bookings (2024)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, padding: '0 10px' }}>
                  {MOCK_CHART_DATA.map(d => (
                    <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>{d.bookings}</div>
                      <div style={{ width: '100%', background: 'var(--green)', borderRadius: '4px 4px 0 0', height: `${(d.bookings / maxBookings) * 140}px`, transition: 'height .3s' }} />
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{d.month}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bottom-grid">
                <div className="bottom-card">
                  <div className="bottom-card-title">Revenue by Month</div>
                  {MOCK_CHART_DATA.map(d => (
                    <div key={d.month} className="bc-row">
                      <span>{d.month}</span>
                      <span>${d.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="bottom-card">
                  <div className="bottom-card-title">Occupancy Overview</div>
                  <div className="bc-row"><span>Total Rooms</span><span>56</span></div>
                  <div className="bc-row"><span>Occupied</span><span style={{ color: 'var(--green)', fontWeight: 700 }}>41</span></div>
                  <div className="bc-row"><span>Available</span><span>15</span></div>
                  <div className="bc-row"><span>Occupancy Rate</span><span style={{ color: 'var(--green)', fontWeight: 700 }}>73%</span></div>
                  <div className="bc-row"><span>Avg. Stay</span><span>3.2 nights</span></div>
                  <div className="bc-row"><span>Avg. Daily Rate</span><span>$185</span></div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
