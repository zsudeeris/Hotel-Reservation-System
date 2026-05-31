import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  Calendar,
  BarChart2,
  Settings,
  MapPin,
  Eye,
  Edit3,
  Power,
  X,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../hooks/useToast.js'
import { createAdminMockData, formatAdminMoney } from '../data/adminMockData.js'

const ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hotels', label: 'Hotels', icon: Building2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'staff', label: 'Staff / Managers', icon: UserCog },
  { id: 'reservations', label: 'All Reservations', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function normalizeStatus(value) {
  return String(value || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/_+/g, '-')
}

function statusClass(value) {
  const normalized = normalizeStatus(value)
  if (['cancelled', 'inactive', 'suspended'].includes(normalized)) return 'danger'
  if (normalized === 'pending') return 'pending'
  return 'active'
}

function formatReservationStatusLabel(status) {
  const normalized = normalizeStatus(status)
  const labels = {
    confirmed: 'CONFIRMED',
    pending: 'PENDING',
    cancelled: 'CANCELLED',
    completed: 'COMPLETED',
    'checked-in': 'CHECKED-IN',
    checkedin: 'CHECKED-IN',
    checked_in: 'CHECKED-IN',
  }
  return labels[normalized] || String(status || '').toUpperCase()
}

function formatDateLabel(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function average(values) {
  const filtered = values.filter(value => Number.isFinite(Number(value)))
  if (!filtered.length) return 0
  return filtered.reduce((sum, value) => sum + Number(value), 0) / filtered.length
}

function AdminDrawer({ open, kicker, title, onClose, children, footer, width = 560 }) {
  if (!open) return null
  return (
    <div className="manager-drawer-overlay" onClick={onClose}>
      <div className="manager-drawer" style={{ width: `min(${width}px, 100%)` }} onClick={e => e.stopPropagation()}>
        <div className="manager-drawer-head">
          <div>
            <div className="manager-drawer-kicker">{kicker}</div>
            <div className="manager-drawer-title">{title}</div>
          </div>
          <button className="manager-drawer-close" type="button" onClick={onClose}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        {children}
        {footer || null}
      </div>
    </div>
  )
}

function ConfirmModal({ open, title, text, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="manager-confirm-overlay" onClick={onCancel}>
      <div className="manager-confirm-card" onClick={e => e.stopPropagation()}>
        <div className="manager-drawer-kicker">Confirmation</div>
        <div className="manager-confirm-title">{title}</div>
        <div className="manager-drawer-copy">{text}</div>
        <div className="manager-confirm-actions">
          <button className="btn-outline" type="button" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn-danger" type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const seed = useMemo(() => createAdminMockData(), [])

  const [view, setView] = useState('dashboard')
  const [hotels, setHotels] = useState(seed.hotels)
  const [users, setUsers] = useState(seed.users)
  const [staff, setStaff] = useState(seed.staff)
  const [reservations, setReservations] = useState(seed.reservations)
  const [activities, setActivities] = useState(seed.activities)
  const [adminSettings, setAdminSettings] = useState(() => ({ ...seed.settings }))

  const [hotelDrawerMode, setHotelDrawerMode] = useState(null)
  const [hotelDraft, setHotelDraft] = useState(null)
  const [selectedHotelId, setSelectedHotelId] = useState(null)

  const [userDrawerMode, setUserDrawerMode] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)

  const [staffDrawerMode, setStaffDrawerMode] = useState(null)
  const [staffDraft, setStaffDraft] = useState(null)
  const [selectedStaffId, setSelectedStaffId] = useState(null)

  const [reservationDrawerOpen, setReservationDrawerOpen] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState(null)
  const [reservationHotelFilter, setReservationHotelFilter] = useState('All Hotels')
  const [reservationHotelMenuOpen, setReservationHotelMenuOpen] = useState(false)
  const reservationHotelFilterRef = useRef(null)

  const [settingsDraft, setSettingsDraft] = useState(() => ({ ...seed.settings }))
  const [maintenanceDraft, setMaintenanceDraft] = useState(() => Boolean(seed.settings.maintenanceMode))
  const [saveFeedback, setSaveFeedback] = useState('')

  const [statusConfirm, setStatusConfirm] = useState(null)

  const selectedHotel = useMemo(
    () => hotels.find(hotel => Number(hotel.id) === Number(selectedHotelId)) || null,
    [hotels, selectedHotelId]
  )
  const selectedUser = useMemo(
    () => users.find(item => Number(item.id) === Number(selectedUserId)) || null,
    [users, selectedUserId]
  )
  const selectedStaff = useMemo(
    () => staff.find(item => Number(item.id) === Number(selectedStaffId)) || null,
    [staff, selectedStaffId]
  )
  const selectedReservation = useMemo(
    () => (Array.isArray(reservations) ? reservations : []).find(item => Number(item.id) === Number(selectedReservationId)) || null,
    [reservations, selectedReservationId]
  )
  const reservationHotelOptions = useMemo(() => {
    const safeHotels = Array.isArray(hotels) ? hotels : []
    return ['All Hotels', ...Array.from(new Set(safeHotels.map(hotel => hotel?.name).filter(Boolean)))]
  }, [hotels])
  const filteredReservations = useMemo(() => {
    const safeReservations = Array.isArray(reservations) ? reservations : []
    if (reservationHotelFilter === 'All Hotels') return safeReservations
    return safeReservations.filter(item => (item.hotel_name || item.hotelName || item.hotel || 'Unknown Hotel') === reservationHotelFilter)
  }, [reservationHotelFilter, reservations])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reservationHotelFilterRef.current && !reservationHotelFilterRef.current.contains(event.target)) {
        setReservationHotelMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (view !== 'settings') return
    setSettingsDraft({ ...adminSettings })
    setMaintenanceDraft(Boolean(adminSettings.maintenanceMode))
  }, [adminSettings, view])

  const adminStats = useMemo(() => {
    const activeManagers = staff.filter(item => normalizeStatus(item.role) === 'hotel-manager' && normalizeStatus(item.status) === 'active').length
    const pendingStaffRequests = staff.filter(item => normalizeStatus(item.status) === 'pending').length
    const totalRevenue = reservations.reduce((sum, res) => sum + Number(res.total_price || 0), 0) || seed.stats.monthlyRevenue
    const avgRating = average(hotels.map(hotel => hotel.rating || 0)) || seed.stats.averageRating
    const topHotel = [...hotels].sort((a, b) => Number(b.monthly_revenue || 0) - Number(a.monthly_revenue || 0))[0]
    const cityCounts = hotels.reduce((acc, hotel) => {
      const key = hotel.city || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || seed.stats.topCity

    return {
      totalHotels: hotels.length,
      totalUsers: users.length,
      totalReservations: seed.stats.totalReservations,
      monthlyRevenue: totalRevenue,
      activeManagers,
      pendingStaffRequests,
      averageOccupancy: seed.stats.averageOccupancy,
      cancellationRate: seed.stats.cancellationRate,
      averageRating: Number(avgRating.toFixed(1)),
      newUsersThisMonth: seed.stats.newUsersThisMonth,
      topCity,
      topHotel: topHotel?.name || seed.stats.topHotel,
    }
  }, [hotels, reservations, seed.stats, staff, users])

  const recentReservations = useMemo(
    () => [...filteredReservations].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6),
    [filteredReservations]
  )
  const recentHotels = useMemo(
    () => [...hotels].sort((a, b) => Number(b.monthly_revenue || 0) - Number(a.monthly_revenue || 0)).slice(0, 5),
    [hotels]
  )
  const recentStaff = useMemo(
    () => [...staff].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5),
    [staff]
  )
  const reservationHotelsByVolume = useMemo(() => {
    const counts = new Map()
    filteredReservations.forEach(item => {
      const key = item.hotel_name || 'Unknown Hotel'
      const hotelMeta = hotels.find(hotel => hotel.name === key) || {}
      const current = counts.get(key) || {
        id: hotelMeta.id || key,
        name: key,
        city: hotelMeta.city || '—',
        rooms_count: hotelMeta.rooms_count || 0,
        value: 0,
      }
      counts.set(key, { ...current, value: current.value + 1 })
    })
    return Array.from(counts.values()).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [filteredReservations, hotels])
  const reservationStatusBars = useMemo(() => {
    const order = ['CONFIRMED', 'PENDING', 'CHECKED-IN', 'COMPLETED', 'CANCELLED']
    return order
      .map(label => ({
        label,
        value: filteredReservations.filter(reservation => formatReservationStatusLabel(reservation.status) === label).length,
      }))
      .filter(item => item.value > 0)
  }, [filteredReservations])
  const monthlyRevenueBars = seed.analytics.monthlyRevenue
  const topHotelBars = useMemo(
    () => [...hotels]
      .sort((a, b) => Number(b.monthly_revenue || 0) - Number(a.monthly_revenue || 0))
      .slice(0, 5)
      .map((hotel, index) => ({
        label: hotel.name,
        value: Math.max(5, 100 - index * 12),
        revenue: Number(hotel.monthly_revenue || 0),
      })),
    [hotels]
  )
  const cityBars = useMemo(() => {
    const counts = hotels.reduce((acc, hotel) => {
      const key = hotel.city || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [hotels])

  const openHotelDrawer = (hotel, mode = 'view') => {
    setSelectedHotelId(hotel.id)
    setHotelDraft({ ...hotel })
    setHotelDrawerMode(mode)
  }

  const openUserDrawer = (item, mode = 'view') => {
    setSelectedUserId(item.id)
    setUserDrawerMode(mode)
  }

  const openStaffDrawer = (item, mode = 'view') => {
    setSelectedStaffId(item.id)
    setStaffDraft({ ...item })
    setStaffDrawerMode(mode)
  }

  const openReservationDrawer = (item) => {
    setSelectedReservationId(item.id)
    setReservationDrawerOpen(true)
  }

  const closeDrawers = () => {
    setHotelDrawerMode(null)
    setHotelDraft(null)
    setSelectedHotelId(null)
    setUserDrawerMode(null)
    setSelectedUserId(null)
    setStaffDrawerMode(null)
    setStaffDraft(null)
    setSelectedStaffId(null)
    setReservationDrawerOpen(false)
    setSelectedReservationId(null)
    setStatusConfirm(null)
  }

  const pushActivity = (text) => {
    setActivities(prev => [{ id: Date.now(), text, time: 'Just now' }, ...prev].slice(0, 5))
  }

  const toggleHotelStatus = (hotelId, hotelName = 'hotel') => {
    setHotels(prev => prev.map(hotel => {
      if (Number(hotel.id) !== Number(hotelId)) return hotel
      const nextStatus = normalizeStatus(hotel.status) === 'active' ? 'Inactive' : 'Active'
      return { ...hotel, status: nextStatus }
    }))
    pushActivity(`Hotel status changed for ${hotelName}`)
    showToast('Hotel status updated.')
  }

  const saveHotelChanges = () => {
    if (!hotelDraft) return
    const nextHotel = {
      ...hotelDraft,
      name: String(hotelDraft.name || '').trim() || 'Untitled Hotel',
      city: String(hotelDraft.city || '').trim() || 'Unknown',
      rating: Number(hotelDraft.rating) || 0,
      rooms_count: Number(hotelDraft.rooms_count) || 0,
      assigned_manager: String(hotelDraft.assigned_manager || '').trim() || 'Unassigned',
      status: String(hotelDraft.status || 'Active'),
      description: String(hotelDraft.description || '').trim(),
      monthly_revenue: Number(hotelDraft.monthly_revenue) || 0,
    }

    setHotels(prev => prev.map(hotel => {
      if (Number(hotel.id) !== Number(nextHotel.id)) return hotel
      return nextHotel
    }))
    setStaff(prev => prev.map(item => {
      if (item.assigned_hotel !== selectedHotel?.name) return item
      return { ...item, assigned_hotel: nextHotel.name }
    }))
    setReservations(prev => prev.map(item => {
      if (Number(item.hotel_id) !== Number(nextHotel.id)) return item
      return { ...item, hotel_name: nextHotel.name }
    }))
    pushActivity(`Hotel profile updated for ${nextHotel.name}`)
    showToast('Hotel saved.')
    closeDrawers()
  }

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(item => {
      if (Number(item.id) !== Number(userId)) return item
      const nextStatus = normalizeStatus(item.status) === 'active' ? 'Suspended' : 'Active'
      return { ...item, status: nextStatus }
    }))
    pushActivity(`Customer status updated`)
    showToast('User status updated.')
  }

  const saveStaffChanges = () => {
    if (!staffDraft) return
    setStaff(prev => prev.map(item => {
      if (Number(item.id) !== Number(staffDraft.id)) return item
      return {
        ...item,
        name: String(staffDraft.name || '').trim() || item.name,
        email: String(staffDraft.email || '').trim() || item.email,
        role: String(staffDraft.role || item.role),
        assigned_hotel: String(staffDraft.assigned_hotel || '').trim() || item.assigned_hotel,
        status: String(staffDraft.status || item.status),
      }
    }))
    pushActivity(`Staff assignment updated for ${staffDraft.name || 'staff member'}`)
    showToast('Staff record saved.')
    closeDrawers()
  }

  const toggleStaffStatus = (staffId) => {
    setStaff(prev => prev.map(item => {
      if (Number(item.id) !== Number(staffId)) return item
      const nextStatus = normalizeStatus(item.status) === 'active' ? 'Suspended' : 'Active'
      return { ...item, status: nextStatus }
    }))
    pushActivity('Staff status updated')
    showToast('Staff status updated.')
  }

  const updateReservationStatus = (reservationId, nextStatus, toastMessage = null) => {
    setReservations(prev => prev.map(item => {
      if (Number(item.id) !== Number(reservationId)) return item
      return { ...item, status: nextStatus }
    }))
    pushActivity(`Reservation ${reservationId} marked as ${nextStatus}`)
    showToast(toastMessage || `Reservation updated to ${formatReservationStatusLabel(nextStatus)}.`)
  }

  const saveSettings = (e) => {
    e.preventDefault()
    const nextSettings = {
      platformName: String(settingsDraft.platformName || '').trim() || 'BookHotel',
      supportEmail: String(settingsDraft.supportEmail || '').trim() || 'support@bookhotel.com',
      cancellationPolicy: String(settingsDraft.cancellationPolicy || '').trim(),
      maintenanceMode: Boolean(maintenanceDraft),
    }
    setAdminSettings(nextSettings)
    setSettingsDraft(nextSettings)
    setMaintenanceDraft(nextSettings.maintenanceMode)
    pushActivity('Platform settings updated')
    setSaveFeedback('Hotel settings saved.')
    showToast('Platform settings saved.')
    window.setTimeout(() => setSaveFeedback(''), 1800)
  }

  const hotelStatusSummary = useMemo(() => {
    const active = hotels.filter(hotel => normalizeStatus(hotel.status) === 'active').length
    const pending = hotels.filter(hotel => normalizeStatus(hotel.status) === 'pending').length
    const inactive = hotels.filter(hotel => normalizeStatus(hotel.status) === 'inactive').length
    return { active, pending, inactive }
  }, [hotels])

  const renderDashboard = () => (
    <>
      <div className="manager-hero admin-hero">
        <div>
          <div className="section-badge">Administrator</div>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.12, color: 'var(--text)', margin: '8px 0' }}>
            BookHotel Platform Control Center
          </div>
          <div className="manager-subtitle">
            <MapPin style={{ width: 14, height: 14 }} />
            Global management view · hotels, users, staff, reservations and platform analytics
          </div>
        </div>
        <div className="manager-hero-badges">
          <span className="td-badge active">Administrator</span>
          <span className="td-badge pending">Platform-wide access</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-lbl">Total Hotels</div>
          <div className="stat-val ok">{adminStats.totalHotels}</div>
          <div className="stat-change">Active, pending and inactive properties</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Total Users</div>
          <div className="stat-val">{adminStats.totalUsers}</div>
          <div className="stat-change">Registered customer accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Total Reservations</div>
          <div className="stat-val">{adminStats.totalReservations}</div>
          <div className="stat-change">Platform reservation volume</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Monthly Revenue</div>
          <div className="stat-val ok">{formatAdminMoney(adminStats.monthlyRevenue)}</div>
          <div className="stat-change">Platform-wide revenue snapshot</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Active Managers</div>
          <div className="stat-val">{adminStats.activeManagers}</div>
          <div className="stat-change">Hotel managers currently active</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Pending Staff Requests</div>
          <div className="stat-val">{adminStats.pendingStaffRequests}</div>
          <div className="stat-change">Waiting for approval</div>
        </div>
      </div>

      <div className="admin-panels" style={{ marginTop: 18 }}>
          <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-panel-title">Platform Snapshot</div>
          <div className="admin-hotel-item">
            <div>
              <div className="admin-hotel-name">{adminSettings.platformName}</div>
              <div className="admin-hotel-city">{adminSettings.supportEmail}</div>
            </div>
            <span className={`td-badge ${adminSettings.maintenanceMode ? 'pending' : 'active'}`}>
              {adminSettings.maintenanceMode ? 'Maintenance On' : 'Maintenance Off'}
            </span>
          </div>
          <div className="admin-stat-item">
            <div>
              <div className="admin-stat-label">Cancellation Policy</div>
              <div className="admin-stat-sub">{adminSettings.cancellationPolicy || 'No policy configured'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panels">
        <div className="admin-panel">
          <div className="admin-panel-title">Recent Reservations</div>
          {recentReservations.length > 0 ? recentReservations.map(reservation => (
            <div key={reservation.id} className="admin-hotel-item">
              <div>
                <div className="admin-hotel-name">{reservation.guest_name}</div>
                <div className="admin-hotel-city">
                  {reservation.hotel_name} · {reservation.room_type} · {formatDateLabel(reservation.check_in_date)} - {formatDateLabel(reservation.check_out_date)}
                </div>
              </div>
              <span className={`td-badge ${statusClass(reservation.status)}`}>{formatReservationStatusLabel(reservation.status)}</span>
            </div>
          )) : (
            <div className="manager-empty">No recent reservations.</div>
          )}
        </div>
        <div className="admin-panel">
          <div className="admin-panel-title">Top Performing Hotels</div>
          {recentHotels.length > 0 ? recentHotels.map(hotel => (
            <div key={hotel.id} className="admin-hotel-item">
              <div>
                <div className="admin-hotel-name">{hotel.name}</div>
                <div className="admin-hotel-city">{hotel.city} · {hotel.rooms_count} rooms</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="admin-stat-val" style={{ fontSize: 18 }}>{formatAdminMoney(hotel.monthly_revenue)}</div>
                <div className="admin-hotel-city">{hotel.status}</div>
              </div>
            </div>
          )) : (
            <div className="manager-empty">No hotel performance data available.</div>
          )}
        </div>
      </div>

      <div className="admin-panels" style={{ marginTop: 18 }}>
        <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-panel-title">Recent Staff Activity</div>
          {activities.length > 0 ? activities.map(activity => (
            <div key={activity.id} className="admin-hotel-item">
              <div>
                <div className="admin-hotel-name">{activity.text}</div>
                <div className="admin-hotel-city">{activity.time}</div>
              </div>
              <span className="td-badge active">Live</span>
            </div>
          )) : (
            <div className="manager-empty">No staff activity available.</div>
          )}
        </div>
      </div>
    </>
  )

  const renderHotels = () => (
    <>
      <div className="dash-main-title">
        Hotels
        <span className="td-badge active">Total {hotels.length}</span>
      </div>

      <div className="users-layout">
        <div className="users-card">
          <div className="users-card-top">
            <div className="users-card-title">All Hotels ({hotels.length})</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hotel Name</th>
                <th>City</th>
                <th>Rating</th>
                <th>Rooms</th>
                <th>Assigned Manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map(hotel => (
                <tr key={hotel.id}>
                  <td>{hotel.id}</td>
                  <td style={{ fontWeight: 600 }}>{hotel.name}</td>
                  <td>{hotel.city}</td>
                  <td>
                    <span className="td-badge active">{hotel.rating}</span>
                  </td>
                  <td>{hotel.rooms_count}</td>
                  <td>{hotel.assigned_manager}</td>
                  <td>
                    <span className={`td-badge ${statusClass(hotel.status)}`}>{hotel.status}</span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="td-edit" type="button" onClick={() => openHotelDrawer(hotel, 'view')} aria-label="View hotel">
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="td-edit" type="button" onClick={() => openHotelDrawer(hotel, 'edit')} aria-label="Edit hotel">
                        <Edit3 style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="td-del" type="button" onClick={() => toggleHotelStatus(hotel.id, hotel.name)} aria-label="Toggle status">
                        <Power style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="role-ctrl">
          <div className="role-ctrl-title">Platform Snapshot</div>
          <div className="admin-stat-item">
            <div>
              <div className="admin-stat-label">Active Hotels</div>
              <div className="admin-stat-sub">Live properties</div>
            </div>
            <div className="admin-stat-val">{hotelStatusSummary.active}</div>
          </div>
          <div className="admin-stat-item">
            <div>
              <div className="admin-stat-label">Pending Hotels</div>
              <div className="admin-stat-sub">Awaiting review</div>
            </div>
            <div className="admin-stat-val">{hotelStatusSummary.pending}</div>
          </div>
          <div className="admin-stat-item" style={{ marginBottom: 0 }}>
            <div>
              <div className="admin-stat-label">Inactive Hotels</div>
              <div className="admin-stat-sub">Hidden from public search</div>
            </div>
            <div className="admin-stat-val">{hotelStatusSummary.inactive}</div>
          </div>
        </div>
      </div>
    </>
  )

  const renderUsers = () => (
    <>
      <div className="dash-main-title">
        Users
        <span className="td-badge pending">Customer accounts</span>
      </div>
      <div className="users-layout">
        <div className="users-card">
          <div className="users-card-top">
            <div className="users-card-title">All Users ({users.length})</div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table admin-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Reservations</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="user-name-cell" title={item.name} style={{ fontWeight: 600 }}>{item.name}</td>
                  <td className="user-email-cell" title={item.email}>{item.email}</td>
                  <td>{item.reservations_count}</td>
                  <td className="joined-cell">{formatDateLabel(item.joined_at)}</td>
                  <td>
                    <span className={`td-badge ${statusClass(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="actions-cell">
                    <div className="td-actions">
                      <button className="td-edit" type="button" onClick={() => openUserDrawer(item, 'view')} aria-label="View user">
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="td-del" type="button" onClick={() => toggleUserStatus(item.id)} aria-label="Toggle user status">
                        <Power style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>

        <div className="role-ctrl">
          <div className="role-ctrl-title">User Health</div>
          <div className="perm-row">
            <span>Active Users</span>
            <strong>{users.filter(item => normalizeStatus(item.status) === 'active').length}</strong>
          </div>
          <div className="perm-row">
            <span>Suspended Users</span>
            <strong>{users.filter(item => normalizeStatus(item.status) === 'suspended').length}</strong>
          </div>
          <div className="perm-row">
            <span>Average Reservations</span>
            <strong>{average(users.map(item => item.reservations_count)).toFixed(1)}</strong>
          </div>
          <div className="perm-row">
            <span>New This Month</span>
            <strong>{adminStats.newUsersThisMonth}</strong>
          </div>
        </div>
      </div>
    </>
  )

  const renderStaff = () => (
    <>
      <div className="dash-main-title">
        Staff / Managers
        <span className="td-badge active">Platform team</span>
      </div>
      <div className="users-layout">
        <div className="users-card">
          <div className="users-card-top">
            <div className="users-card-title">All Staff ({staff.length})</div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table admin-staff-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned Hotel</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="staff-name-cell" title={item.name} style={{ fontWeight: 600 }}>{item.name}</td>
                  <td className="staff-email-cell" title={item.email}>{item.email}</td>
                  <td>
                    <span className={`td-badge ${normalizeStatus(item.role) === 'administrator' ? 'active' : 'pending'}`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="assigned-hotel-cell" title={item.assigned_hotel}>{item.assigned_hotel}</td>
                  <td>
                    <span className={`td-badge ${statusClass(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="actions-cell">
                    <div className="td-actions">
                      <button className="td-edit" type="button" onClick={() => openStaffDrawer(item, 'view')} aria-label="View staff">
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="td-edit" type="button" onClick={() => openStaffDrawer(item, 'edit')} aria-label="Assign hotel">
                        <Edit3 style={{ width: 14, height: 14 }} />
                      </button>
                      {normalizeStatus(item.role) !== 'administrator' && (
                        <button className="td-del" type="button" onClick={() => toggleStaffStatus(item.id)} aria-label="Toggle staff status">
                          <Power style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>

        <div className="role-ctrl">
          <div className="role-ctrl-title">Staff Summary</div>
          <div className="perm-row">
            <span>Administrators</span>
            <strong>{staff.filter(item => normalizeStatus(item.role) === 'administrator').length}</strong>
          </div>
          <div className="perm-row">
            <span>Hotel Managers</span>
            <strong>{staff.filter(item => normalizeStatus(item.role) === 'hotel-manager').length}</strong>
          </div>
          <div className="perm-row">
            <span>Active Staff</span>
            <strong>{staff.filter(item => normalizeStatus(item.status) === 'active').length}</strong>
          </div>
          <div className="perm-row">
            <span>Pending Staff</span>
            <strong>{staff.filter(item => normalizeStatus(item.status) === 'pending').length}</strong>
          </div>
        </div>
      </div>
    </>
  )

  const renderReservations = () => (
    <>
      <div className="dash-main-title">
        All Reservations
        <span className="td-badge pending">{filteredReservations.length} bookings</span>
      </div>
      <div className="table-card admin-reservations-card">
        <div className="table-card-head admin-reservations-head">
          <span className="table-card-title">Platform Reservations ({filteredReservations.length})</span>
          <div className="admin-filter-wrap" ref={reservationHotelFilterRef}>
            <span>Filter by Hotel</span>
            <button
              type="button"
              className="admin-filter-trigger"
              onClick={() => setReservationHotelMenuOpen(prev => !prev)}
              aria-haspopup="listbox"
              aria-expanded={reservationHotelMenuOpen}
            >
              <span className="admin-filter-trigger-text">{reservationHotelFilter}</span>
              <span className="admin-filter-chevron" aria-hidden="true">▾</span>
            </button>
            {reservationHotelMenuOpen ? (
              <div className="admin-filter-menu" role="listbox" aria-label="Filter by hotel">
                {reservationHotelOptions.map(option => {
                  const isSelected = option === reservationHotelFilter
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`admin-filter-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setReservationHotelFilter(option)
                        setReservationHotelMenuOpen(false)
                      }}
                    >
                      <span>{option}</span>
                      {isSelected ? <span className="admin-filter-check">✓</span> : null}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
        <div className="admin-reservations-scroll">
          <table className="admin-reservations-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Hotel</th>
                <th>Guest</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Room</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(item => {
                const hotelName = item.hotel_name || item.hotelName || item.hotel || 'Unknown Hotel'
                const guestName = item.guest_name || item.guestName || item.guest || 'Unknown Guest'
                return (
                <tr key={item.id}>
                  <td className="booking-id-cell" style={{ fontWeight: 600 }}>{item.booking_id}</td>
                  <td className="hotel-cell" title={hotelName}>{hotelName}</td>
                  <td className="guest-cell" title={guestName}>{guestName}</td>
                  <td>{formatDateLabel(item.check_in_date)}</td>
                  <td>{formatDateLabel(item.check_out_date)}</td>
                  <td>{item.room_type}</td>
                  <td>
                    <span className={`td-badge ${statusClass(item.status)}`}>
                      {formatReservationStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>{formatAdminMoney(item.total_price)}</td>
                  <td>
                    <div className="td-actions">
                      <button className="td-edit" type="button" onClick={() => openReservationDrawer(item)} aria-label="View reservation">
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-panels" style={{ marginTop: 18 }}>
        <div className="admin-panel">
          <div className="admin-panel-title">Reservation Status Summary</div>
          {reservationStatusBars.length > 0 ? reservationStatusBars.map(item => {
            const max = Math.max(...reservationStatusBars.map(entry => entry.value))
            const width = max ? (item.value / max) * 100 : 0
            return (
              <div key={item.label} className="admin-hotel-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div style={{ height: 10, background: 'var(--bg)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(width, 8)}%`, height: '100%', background: 'var(--green)' }} />
                </div>
              </div>
            )
          }) : <div className="manager-empty">No reservation data available.</div>}
        </div>
        <div className="admin-panel">
          <div className="admin-panel-title">Top Hotels by Reservation Volume</div>
          {reservationHotelsByVolume.length > 0 ? reservationHotelsByVolume.map(hotel => (
            <div key={hotel.id} className="admin-hotel-item">
              <div>
                <div className="admin-hotel-name">{hotel.name}</div>
                <div className="admin-hotel-city">{hotel.city}</div>
              </div>
              <span className="td-badge active">{hotel.value} bookings</span>
            </div>
          )) : <div className="manager-empty">No hotel data available.</div>}
        </div>
      </div>
    </>
  )

  const renderAnalytics = () => (
    <>
      <div className="dash-main-title">Analytics</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-lbl">Total Revenue</div>
          <div className="stat-val ok">{formatAdminMoney(adminStats.monthlyRevenue)}</div>
          <div className="stat-change">Platform-wide monthly snapshot</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Monthly Bookings</div>
          <div className="stat-val">{Math.max(64, reservations.length * 2)}</div>
          <div className="stat-change">Demo platform booking velocity</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Average Occupancy</div>
          <div className="stat-val">{adminStats.averageOccupancy}%</div>
          <div className="stat-change">Across active hotels</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Cancellation Rate</div>
          <div className="stat-val">{adminStats.cancellationRate}%</div>
          <div className="stat-change">Bookings cancelled</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Top City</div>
          <div className="stat-val" style={{ fontSize: 24 }}>{adminStats.topCity}</div>
          <div className="stat-change">Most active market</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Average Rating</div>
          <div className="stat-val ok">{adminStats.averageRating}</div>
          <div className="stat-change">Guest satisfaction</div>
        </div>
      </div>

      <div className="bottom-grid" style={{ marginTop: 18 }}>
        <div className="chart-card">
          <div className="chart-card-title">Revenue by Month</div>
          <div className="room-type-chart">
            {monthlyRevenueBars.map(item => {
              const max = Math.max(...monthlyRevenueBars.map(entry => entry.revenue))
              const width = max ? (item.revenue / max) * 100 : 0
              return (
                <div key={item.month} className="room-type-chart-row">
                  <div className="room-type-chart-head">
                    <span className="room-type-chart-label">{item.month}</span>
                    <span className="room-type-chart-value">{formatAdminMoney(item.revenue)}</span>
                  </div>
                  <div className="room-type-chart-track">
                    <div className="room-type-chart-bar" style={{ width: `${Math.max(width, 12)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Reservations by Status</div>
          <div className="room-type-chart">
            {reservationStatusBars.map(item => {
              const max = Math.max(...reservationStatusBars.map(entry => entry.value))
              const width = max ? (item.value / max) * 100 : 0
              return (
                <div key={item.label} className="room-type-chart-row">
                  <div className="room-type-chart-head">
                    <span className="room-type-chart-label">{item.label}</span>
                    <span className="room-type-chart-value">{item.value}</span>
                  </div>
                  <div className="room-type-chart-track">
                    <div className="room-type-chart-bar" style={{ width: `${Math.max(width, 12)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bottom-grid" style={{ marginTop: 18 }}>
        <div className="chart-card">
          <div className="chart-card-title">Top Performing Hotels</div>
          <div className="room-type-chart">
            {topHotelBars.map(item => {
              const max = Math.max(...topHotelBars.map(entry => entry.value))
              const width = max ? (item.value / max) * 100 : 0
              return (
                <div key={item.label} className="room-type-chart-row">
                  <div className="room-type-chart-head">
                    <span className="room-type-chart-label">{item.label}</span>
                    <span className="room-type-chart-value">{formatAdminMoney(item.revenue)}</span>
                  </div>
                  <div className="room-type-chart-track">
                    <div className="room-type-chart-bar" style={{ width: `${Math.max(width, 12)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Most Booked Cities</div>
          <div className="room-type-chart">
            {cityBars.map(item => {
              const max = Math.max(...cityBars.map(entry => entry.value))
              const width = max ? (item.value / max) * 100 : 0
              return (
                <div key={item.label} className="room-type-chart-row">
                  <div className="room-type-chart-head">
                    <span className="room-type-chart-label">{item.label}</span>
                    <span className="room-type-chart-value">{item.value}</span>
                  </div>
                  <div className="room-type-chart-track">
                    <div className="room-type-chart-bar" style={{ width: `${Math.max(width, 12)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )

  const renderSettings = () => (
    <>
      <div className="dash-main-title">Settings</div>
      <form className="activity-card" onSubmit={saveSettings}>
        <div className="activity-title">Platform Settings</div>
        <div className="settings-grid">
          <label className="settings-field">
            <span>Platform Name</span>
            <input
              className="form-inp"
              value={settingsDraft.platformName}
              onChange={e => setSettingsDraft(prev => ({ ...prev, platformName: e.target.value }))}
            />
          </label>
          <label className="settings-field">
            <span>Support Email</span>
            <input
              className="form-inp"
              value={settingsDraft.supportEmail}
              onChange={e => setSettingsDraft(prev => ({ ...prev, supportEmail: e.target.value }))}
            />
          </label>
          <label className="settings-field" style={{ gridColumn: '1 / -1' }}>
            <span>Default Cancellation Policy</span>
            <textarea
              className="form-inp"
              rows={4}
              value={settingsDraft.cancellationPolicy}
              onChange={e => setSettingsDraft(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </label>
          <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
            <span>Maintenance Mode</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0 2px' }}>
              <label className="toggle-wrap">
                <input
                  type="checkbox"
                  checked={maintenanceDraft}
                  onChange={e => setMaintenanceDraft(e.target.checked)}
                />
                <span className="toggle-track" />
                <span className="toggle-knob" />
              </label>
              <div style={{ fontSize: 13, color: 'var(--sub)' }}>
                {maintenanceDraft ? 'Enabled for demo maintenance mode' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <button className="btn-add" type="submit">Save Changes</button>
          {saveFeedback ? <div style={{ color: 'var(--green-dark)', fontSize: 13, fontWeight: 600 }}>{saveFeedback}</div> : null}
        </div>
      </form>
    </>
  )

  const currentContent = {
    dashboard: renderDashboard,
    hotels: renderHotels,
    users: renderUsers,
    staff: renderStaff,
    reservations: renderReservations,
    analytics: renderAnalytics,
    settings: renderSettings,
  }[view]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar staffMeta={{ roleLabel: 'Administrator' }} />
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">
            <LayoutDashboard style={{ width: 20, height: 20, stroke: 'var(--green)' }} />
            Admin Panel
          </div>
          <nav className="snav">
            {ADMIN_NAV.map(item => (
              <button
                key={item.id}
                className={`snav-btn ${view === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id)}
                type="button"
              >
                <span className="snav-ico"><item.icon /></span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="dash-main">
          {currentContent ? currentContent() : null}
        </main>
      </div>

      <AdminDrawer
        open={hotelDrawerMode !== null && Boolean(hotelDraft)}
        kicker={hotelDrawerMode === 'edit' ? 'Edit Hotel' : 'View Hotel'}
        title={hotelDraft?.name || 'Hotel'}
        onClose={closeDrawers}
        width={620}
        footer={
          <div className="manager-confirm-actions">
            {hotelDrawerMode === 'view' ? (
              <>
                <button className="btn-outline" type="button" onClick={closeDrawers}>Close</button>
                <button className="btn-add" type="button" onClick={() => setHotelDrawerMode('edit')}>Edit Hotel</button>
              <button className="btn-danger" type="button" onClick={() => toggleHotelStatus(hotelDraft.id, hotelDraft.name)}>
                  {normalizeStatus(hotelDraft.status) === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </>
            ) : (
              <>
                <button className="btn-outline" type="button" onClick={() => {
                  setHotelDraft(selectedHotel ? { ...selectedHotel } : hotelDraft)
                  setHotelDrawerMode('view')
                }}>
                  Cancel
                </button>
                <button className="btn-add" type="button" onClick={saveHotelChanges}>Save Changes</button>
              </>
            )}
          </div>
        }
      >
          <div className="manager-drawer-grid">
          <label className="manager-detail-item">
            <span>Hotel Name</span>
            {hotelDrawerMode === 'edit' ? (
              <input className="form-inp" value={hotelDraft?.name || ''} onChange={e => setHotelDraft(prev => ({ ...prev, name: e.target.value }))} />
            ) : (
              <strong>{hotelDraft?.name || '—'}</strong>
            )}
          </label>
          <label className="manager-detail-item">
            <span>City</span>
            {hotelDrawerMode === 'edit' ? (
              <input className="form-inp" value={hotelDraft?.city || ''} onChange={e => setHotelDraft(prev => ({ ...prev, city: e.target.value }))} />
            ) : (
              <strong>{hotelDraft?.city || '—'}</strong>
            )}
          </label>
          <label className="manager-detail-item">
            <span>Rating</span>
            {hotelDrawerMode === 'edit' ? (
              <input className="form-inp" type="number" min="0" max="10" step="0.1" value={hotelDraft?.rating ?? ''} onChange={e => setHotelDraft(prev => ({ ...prev, rating: e.target.value }))} />
            ) : (
              <strong>{hotelDraft?.rating ?? '—'}</strong>
            )}
          </label>
          <label className="manager-detail-item">
            <span>Rooms Count</span>
            {hotelDrawerMode === 'edit' ? (
              <input className="form-inp" type="number" min="0" value={hotelDraft?.rooms_count ?? ''} onChange={e => setHotelDraft(prev => ({ ...prev, rooms_count: e.target.value }))} />
            ) : (
              <strong>{hotelDraft?.rooms_count ?? '—'}</strong>
            )}
          </label>
          <label className="manager-detail-item">
            <span>Assigned Manager</span>
            {hotelDrawerMode === 'edit' ? (
              <input className="form-inp" value={hotelDraft?.assigned_manager || ''} onChange={e => setHotelDraft(prev => ({ ...prev, assigned_manager: e.target.value }))} />
            ) : (
              <strong>{hotelDraft?.assigned_manager || '—'}</strong>
            )}
          </label>
          <label className="manager-detail-item">
            <span>Status</span>
            {hotelDrawerMode === 'edit' ? (
              <select className="form-inp" value={hotelDraft?.status || 'Active'} onChange={e => setHotelDraft(prev => ({ ...prev, status: e.target.value }))}>
                <option>Active</option>
                <option>Pending</option>
                <option>Inactive</option>
              </select>
            ) : (
              <strong><span className={`td-badge ${statusClass(hotelDraft?.status)}`} style={{ display: 'inline-flex' }}>{hotelDraft?.status || '—'}</span></strong>
            )}
          </label>
          <label className="manager-detail-item" style={{ gridColumn: '1 / -1' }}>
            <span>Description</span>
            {hotelDrawerMode === 'edit' ? (
              <textarea className="form-inp" rows={4} value={hotelDraft?.description || ''} onChange={e => setHotelDraft(prev => ({ ...prev, description: e.target.value }))} />
            ) : (
              <strong style={{ fontWeight: 500 }}>{hotelDraft?.description || '—'}</strong>
            )}
          </label>
        </div>
      </AdminDrawer>

      <AdminDrawer
        open={userDrawerMode !== null && Boolean(selectedUser)}
        kicker="Customer Profile"
        title={selectedUser?.name || 'User'}
        onClose={closeDrawers}
        width={560}
        footer={
          <div className="manager-confirm-actions">
            <button className="btn-outline" type="button" onClick={closeDrawers}>Close</button>
            <button className="btn-danger" type="button" onClick={() => toggleUserStatus(selectedUser.id)}>
              {normalizeStatus(selectedUser?.status) === 'active' ? 'Suspend User' : 'Activate User'}
            </button>
          </div>
        }
      >
        <div className="manager-drawer-grid">
          <div className="manager-detail-item">
            <span>User ID</span>
            <strong>{selectedUser?.id}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Email</span>
            <strong>{selectedUser?.email}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Reservations Count</span>
            <strong>{selectedUser?.reservations_count}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Status</span>
            <strong><span className={`td-badge ${statusClass(selectedUser?.status)}`} style={{ display: 'inline-flex' }}>{selectedUser?.status}</span></strong>
          </div>
          <div className="manager-detail-item">
            <span>Joined Date</span>
            <strong>{formatDateLabel(selectedUser?.joined_at)}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Profile Type</span>
            <strong>Customer account</strong>
          </div>
        </div>
      </AdminDrawer>

      <AdminDrawer
        open={staffDrawerMode !== null && Boolean(selectedStaff)}
        kicker={staffDrawerMode === 'edit' ? 'Assign Hotel' : 'Staff Profile'}
        title={selectedStaff?.name || 'Staff Member'}
        onClose={closeDrawers}
        width={620}
        footer={
          <div className="manager-confirm-actions">
            {staffDrawerMode === 'edit' ? (
              <>
                <button className="btn-outline" type="button" onClick={closeDrawers}>Cancel</button>
                <button className="btn-add" type="button" onClick={saveStaffChanges}>Save Changes</button>
              </>
            ) : (
              <>
                <button className="btn-outline" type="button" onClick={closeDrawers}>Close</button>
                {normalizeStatus(selectedStaff?.role) !== 'administrator' && (
                  <button className="btn-danger" type="button" onClick={() => toggleStaffStatus(selectedStaff.id)}>
                    {normalizeStatus(selectedStaff?.status) === 'active' ? 'Suspend Staff' : 'Activate Staff'}
                  </button>
                )}
              </>
            )}
          </div>
        }
      >
        <div className="manager-drawer-grid">
          <label className="manager-detail-item">
            <span>Staff ID</span>
            {staffDrawerMode === 'edit' ? (
              <input className="form-inp" value={staffDraft?.id || ''} disabled />
            ) : (
              <strong>{selectedStaff?.id}</strong>
            )}
          </label>
          <label className="manager-detail-item">
            <span>Name</span>
            {staffDrawerMode === 'edit' ? (
              <input className="form-inp" value={staffDraft?.name || ''} onChange={e => setStaffDraft(prev => ({ ...prev, name: e.target.value }))} />
            ) : (
              <strong>{selectedStaff?.name}</strong>
            )}
          </label>
          <label className="manager-detail-item">
            <span>Email</span>
            {staffDrawerMode === 'edit' ? (
              <input className="form-inp" value={staffDraft?.email || ''} onChange={e => setStaffDraft(prev => ({ ...prev, email: e.target.value }))} />
            ) : (
              <strong>{selectedStaff?.email}</strong>
            )}
          </label>
          <div className="manager-detail-item">
            <span>Role</span>
            <strong>{selectedStaff?.role}</strong>
          </div>
          <label className="manager-detail-item">
            <span>Assigned Hotel</span>
            {staffDrawerMode === 'edit' ? (
              <select
                className="form-inp"
                value={staffDraft?.assigned_hotel || 'All Hotels'}
                onChange={e => setStaffDraft(prev => ({ ...prev, assigned_hotel: e.target.value }))}
              >
                <option value="All Hotels">All Hotels</option>
                {hotels.map(hotel => <option key={hotel.id} value={hotel.name}>{hotel.name}</option>)}
              </select>
            ) : (
              <strong>{selectedStaff?.assigned_hotel}</strong>
            )}
          </label>
          <label className="manager-detail-item">
            <span>Status</span>
            {staffDrawerMode === 'edit' ? (
              <select
                className="form-inp"
                value={staffDraft?.status || 'Active'}
                onChange={e => setStaffDraft(prev => ({ ...prev, status: e.target.value }))}
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
            ) : (
              <strong><span className={`td-badge ${statusClass(selectedStaff?.status)}`} style={{ display: 'inline-flex' }}>{selectedStaff?.status}</span></strong>
            )}
          </label>
        </div>
      </AdminDrawer>

      <AdminDrawer
        open={reservationDrawerOpen && Boolean(selectedReservation)}
        kicker="Reservation Details"
        title={`Booking #${selectedReservation?.booking_id || selectedReservation?.id || '—'}`}
        onClose={closeDrawers}
        width={640}
        footer={
          <div className="manager-confirm-actions">
            <button className="btn-outline" type="button" onClick={closeDrawers}>Close</button>
            {normalizeStatus(selectedReservation?.status) === 'pending' && (
              <button className="btn-add" type="button" onClick={() => updateReservationStatus(selectedReservation.id, 'CONFIRMED')}>
                Confirm Booking
              </button>
            )}
            {(normalizeStatus(selectedReservation?.status) === 'pending' || normalizeStatus(selectedReservation?.status) === 'confirmed') && (
              <button className="btn-danger" type="button" onClick={() => setStatusConfirm({ id: selectedReservation.id, next: 'CANCELLED', label: 'Cancel Reservation', text: 'Are you sure you want to cancel this reservation?' })}>
                Cancel Reservation
              </button>
            )}
            {normalizeStatus(selectedReservation?.status) === 'confirmed' && (
              <button className="btn-add" type="button" onClick={() => updateReservationStatus(selectedReservation.id, 'CHECKED-IN')}>
                Mark as Checked-in
              </button>
            )}
            {normalizeStatus(selectedReservation?.status) === 'checked-in' && (
              <button className="btn-add" type="button" onClick={() => updateReservationStatus(selectedReservation.id, 'COMPLETED')}>
                Mark as Completed
              </button>
            )}
            {normalizeStatus(selectedReservation?.status) === 'completed' && (
              <button className="btn-add" type="button" onClick={() => showToast('Summary is available in the analytics section.')}>
                View Summary
              </button>
            )}
          </div>
        }
      >
        <div className="manager-drawer-grid">
          <div className="manager-detail-item">
            <span>Guest Name</span>
            <strong>{selectedReservation?.guest_name || '—'}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Guest Email</span>
            <strong>{selectedReservation?.guest_email || '—'}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Hotel</span>
            <strong>{selectedReservation?.hotel_name || '—'}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Room Type</span>
            <strong>{selectedReservation?.room_type || '—'}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Check-in</span>
            <strong>{formatDateLabel(selectedReservation?.check_in_date)}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Check-out</span>
            <strong>{formatDateLabel(selectedReservation?.check_out_date)}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Guests</span>
            <strong>{selectedReservation?.guests || '—'}</strong>
          </div>
          <div className="manager-detail-item">
            <span>Total Price</span>
            <strong>{formatAdminMoney(selectedReservation?.total_price)}</strong>
          </div>
          <div className="manager-detail-item" style={{ gridColumn: '1 / -1' }}>
            <span>Status</span>
            <strong>
              <span className={`td-badge ${statusClass(selectedReservation?.status)}`} style={{ display: 'inline-flex' }}>
                {formatReservationStatusLabel(selectedReservation?.status)}
              </span>
            </strong>
          </div>
        </div>
        <div className="manager-drawer-block">
          <div className="manager-drawer-section-title">Special Requests</div>
          <div className="manager-drawer-copy">{selectedReservation?.special_requests || 'No special requests'}</div>
        </div>
        <div className="manager-drawer-block">
          <div className="manager-drawer-section-title">Notes</div>
          <div className="manager-drawer-copy">
            {selectedReservation?.internal_note || 'No internal note yet'}
          </div>
        </div>
      </AdminDrawer>

      <ConfirmModal
        open={Boolean(statusConfirm)}
        title={statusConfirm?.label || 'Confirm Action'}
        text={statusConfirm?.text || 'Are you sure?'}
        confirmLabel={statusConfirm?.label || 'Confirm'}
        onCancel={() => setStatusConfirm(null)}
        onConfirm={() => {
          if (!statusConfirm) return
          updateReservationStatus(
            statusConfirm.id,
            statusConfirm.next,
            statusConfirm.next === 'CANCELLED' ? 'Reservation cancelled.' : undefined
          )
          setStatusConfirm(null)
        }}
      />
    </div>
  )
}
