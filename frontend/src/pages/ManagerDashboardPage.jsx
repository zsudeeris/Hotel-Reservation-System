import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  LayoutDashboard,
  BedDouble,
  Image,
  BarChart2,
  MessageSquare,
  Settings,
  Calendar,
  MapPin,
  ChevronRight,
  Plus,
  X,
  Trash2,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getHotel, getHotelReviews, getHotelRooms, managerGetReservations, managerGetStats } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reservations', label: 'Reservations', icon: Calendar },
  { id: 'rooms', label: 'Rooms', icon: BedDouble },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function formatDateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateLabel(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMoney(value) {
  return `EUR ${Number(value || 0).toLocaleString()}`
}

function normalizeStatus(status) {
  return String(status || '').toLowerCase()
}

function preferPositive(value, fallback) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
}

function titleizeStatus(status) {
  const normalized = String(status || '').toLowerCase().replace(/\s+/g, '-').replace(/_+/g, '-')
  const labels = {
    confirmed: 'CONFIRMED',
    pending: 'PENDING',
    cancelled: 'CANCELLED',
    completed: 'COMPLETED',
    'checked-in': 'CHECKED-IN',
    checkedin: 'CHECKED-IN',
  }
  return labels[normalized] || String(status || '').toUpperCase()
}

function statusBadgeClass(status) {
  const normalized = normalizeStatus(status)
  if (normalized === 'cancelled') return 'danger'
  if (normalized === 'pending') return 'pending'
  return 'active'
}

function reservationKey(reservation) {
  return String(
    reservation?.id ||
    reservation?.booking_id ||
    `${reservation?.guest_email || 'guest'}-${reservation?.check_in_date || reservation?.check_in || 'no-date'}`
  )
}

function reservationSpecialRequests(reservation) {
  return reservation?.special_requests || reservation?.special_request || ''
}

function reservationInternalNote(reservation) {
  return reservation?.internal_note || reservation?.manager_note || ''
}

function roomStatusLabel(status) {
  return titleizeStatus(status || 'Available')
}

function roomStatusClass(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'available') return 'active'
  if (normalized === 'maintenance') return 'pending'
  return 'danger'
}

function roomLabel(room) {
  return room?.room_type || room?.name || `Room #${room?.room_number || room?.id || '—'}`
}

function resolveRoomImage(room, index, hotelImage) {
  if (room?.img && room.img !== hotelImage) return room.img

  const pools = {
    'Standard Room': [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80',
    ],
    'Deluxe Room': [
      'https://images.unsplash.com/photo-1560067174-8943bdedffb3?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
    ],
    'Deluxe Sea View Room': [
      'https://images.unsplash.com/photo-1501117716987-c8e2a1e3f2d7?w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&sat=-10',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1200&q=80',
    ],
    'Family Suite': [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80&fit=crop',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80&sat=-20',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&q=80',
    ],
  }
  const pool = pools[room?.room_type] || pools['Standard Room']
  return pool[index % pool.length]
}

function reservationGuest(reservation) {
  return reservation?.guest_name || reservation?.user_name || reservation?.guest_email || 'Guest'
}

function reservationRoom(reservation) {
  return reservation?.room_type || reservation?.room_name || reservation?.room_number || 'Room'
}

function readStoredManagerHotel(storageKey) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredManagerHotel(storageKey, hotel) {
  return
}

function readStoredManagerReservations(storageKey) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredManagerReservations(storageKey, reservations) {
  return
}

function readStoredManagerRooms(storageKey) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredManagerRooms(storageKey, rooms) {
  return
}

function mergeReservationCollections(baseReservations, storedReservations) {
  const map = new Map()
  ;[...(Array.isArray(baseReservations) ? baseReservations : []), ...(Array.isArray(storedReservations) ? storedReservations : [])].forEach(reservation => {
    map.set(reservationKey(reservation), {
      ...map.get(reservationKey(reservation)),
      ...reservation,
    })
  })
  return Array.from(map.values())
}

function roomKey(room) {
  return String(room?.id || room?.room_number || `${room?.room_type || 'room'}-${room?.description || ''}`)
}

function mergeRoomCollections(baseRooms, storedRooms) {
  const map = new Map()
  ;[...(Array.isArray(baseRooms) ? baseRooms : []), ...(Array.isArray(storedRooms) ? storedRooms : [])].forEach(room => {
    map.set(roomKey(room), {
      ...map.get(roomKey(room)),
      ...room,
    })
  })
  return Array.from(map.values())
}

function getDefaultManagerHotel() {
  return {
    hotel_name: 'The Arkin Iskele Hotel',
    city: 'Iskele',
    district: 'Northern Cyprus',
    description: 'Located in the Gazimağusa region of Cyprus, The Arkin Iskele Hotel offers guests a relaxing and enjoyable holiday experience with modern rooms, sea views, family-friendly facilities, and premium hotel amenities.',
    check_in_time: '14:00',
    check_out_time: '12:00',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80',
    score: null,
  }
}

function readStoredManagerMedia(storageKey) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredManagerMedia(storageKey, items) {
  return
}

function mediaKey(item, index = 0) {
  return String(item?.id || item?.src || `media-${index}`)
}

function buildBaseMediaItems(displayHotel, mergedRooms, hotelName, hotelImage) {
  const unique = new Map()
  const add = (item) => {
    if (!item?.src) return
    const key = item.src
    if (!unique.has(key)) unique.set(key, item)
  }

  add({ id: 'hotel-exterior', src: displayHotel?.img || hotelImage, label: hotelName || 'Hotel exterior' })
  mergedRooms.forEach((room, index) => {
    const src = resolveRoomImage(room, index, displayHotel?.img || hotelImage)
    add({ id: `room-${roomKey(room)}`, src, label: roomLabel(room) })
  })

  return Array.from(unique.values()).slice(0, 12)
}

export default function ManagerDashboardPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef(null)
  const [view, setView] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [reservations, setReservations] = useState([])
  const [hotel, setHotel] = useState(null)
  const [managerHotel, setManagerHotel] = useState(getDefaultManagerHotel())
  const [hotelReviews, setHotelReviews] = useState({ reviews: [], stats: null })
  const [roomAvailability, setRoomAvailability] = useState([])
  const [resolvedHotelId, setResolvedHotelId] = useState(null)
  const [managerReservations, setManagerReservations] = useState([])
  const [managerRooms, setManagerRooms] = useState([])
  const [selectedReservationId, setSelectedReservationId] = useState(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [cancelTargetId, setCancelTargetId] = useState(null)
  const [roomEditorOpen, setRoomEditorOpen] = useState(false)
  const [roomEditorMode, setRoomEditorMode] = useState('edit')
  const [roomDraft, setRoomDraft] = useState(null)
  const [roomDeleteTarget, setRoomDeleteTarget] = useState(null)
  const [mediaGallery, setMediaGallery] = useState([])
  const [mediaError, setMediaError] = useState('')
  const [mediaDragActive, setMediaDragActive] = useState(false)
  const [settings, setSettings] = useState({
    hotel_name: getDefaultManagerHotel().hotel_name,
    city: getDefaultManagerHotel().city,
    district: getDefaultManagerHotel().district,
    description: getDefaultManagerHotel().description,
    check_in_time: '14:00',
    check_out_time: '12:00',
  })

  const hotelId = Number(user?.hotel_id ?? user?.hotelId ?? 0)
  const effectiveHotelId = Number(resolvedHotelId || hotelId || 0)
  const storageKey = `bookhotel:managerHotel:${effectiveHotelId || hotelId || 'default'}`
  const reservationStorageKey = `bookhotel:managerReservations:${effectiveHotelId || hotelId || 'default'}`
  const roomStorageKey = `bookhotel:managerRooms:${effectiveHotelId || hotelId || 'default'}`
  const mediaStorageKey = `bookhotel:managerMediaImages:${effectiveHotelId || hotelId || 'default'}`
  const displayHotel = managerHotel || hotel || {}
  const hotelName = displayHotel?.hotel_name || user?.hotel_name || user?.hotelName || 'Assigned Hotel'
  const hotelCity = displayHotel?.city || ''
  const hotelDistrict = displayHotel?.district || ''
  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      try {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        const [statsData, reservationsData] = await Promise.all([
          managerGetStats(),
          managerGetReservations(),
        ])

        if (!active) return

        const reservationList = Array.isArray(reservationsData) ? reservationsData : (reservationsData?.reservations || [])
        const inferredHotelId = Number(hotelId || statsData?.hotel_id || 0)

        setStats(statsData || null)
        setReservations(reservationList)
        setManagerReservations(reservationList)
        setResolvedHotelId(inferredHotelId || null)

        if (!inferredHotelId) {
          setHotel(null)
          setManagerHotel(getDefaultManagerHotel())
          setHotelReviews({ reviews: [], stats: null })
          setRoomAvailability([])
          setManagerRooms([])
          return
        }

        const [hotelData, reviewsData, availabilityData] = await Promise.all([
          getHotel(inferredHotelId),
          getHotelReviews(inferredHotelId),
          getHotelRooms(inferredHotelId, {
            checkin: formatDateInput(today),
            checkout: formatDateInput(tomorrow),
            guest_count: 1,
          }),
        ])

        if (!active) return

        const availableRooms = Array.isArray(availabilityData) ? availabilityData : []
        const mergedManagerHotel = {
          hotel_name: hotelData?.hotel_name ?? getDefaultManagerHotel().hotel_name,
          city: hotelData?.city ?? getDefaultManagerHotel().city,
          district: hotelData?.district ?? getDefaultManagerHotel().district,
          description: hotelData?.description ?? getDefaultManagerHotel().description,
          check_in_time: hotelData?.check_in_time ?? '14:00',
          check_out_time: hotelData?.check_out_time ?? '12:00',
          img: hotelData?.img || getDefaultManagerHotel().img,
          score: hotelData?.score ?? null,
        }

        setHotel(hotelData || null)
        setManagerHotel(mergedManagerHotel)
        setHotelReviews({
          reviews: Array.isArray(reviewsData?.reviews) ? reviewsData.reviews : (hotelData?.guest_reviews || []),
          stats: reviewsData?.stats || null,
        })
        setRoomAvailability(availableRooms)
        setManagerRooms(availableRooms)
        setSettings({
          hotel_name: mergedManagerHotel.hotel_name,
          city: mergedManagerHotel.city,
          district: mergedManagerHotel.district,
          description: mergedManagerHotel.description,
          check_in_time: mergedManagerHotel.check_in_time,
          check_out_time: mergedManagerHotel.check_out_time,
        })
      } catch (error) {
        if (!active) return
        console.error('Manager dashboard load failed:', error)
        setStats(null)
        setReservations([])
        setManagerReservations([])
        setManagerRooms([])
        setHotel(null)
        setHotelReviews({ reviews: [], stats: null })
        setRoomAvailability([])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const mergedRooms = useMemo(() => managerRooms, [managerRooms])

  const displayStats = useMemo(() => ({
    total_reservations: stats?.total_reservations ?? reservations.length,
    active_reservations: stats?.active_reservations ?? reservations.filter(r => r.status === 'CONFIRMED').length,
    total_revenue: stats?.total_revenue ?? 0,
    total_rooms: stats?.total_rooms ?? mergedRooms.length,
    available_rooms: stats?.available_rooms ?? mergedRooms.length,
    occupancy_rate: stats?.occupancy_rate ?? 0,
    avg_rating: stats?.avg_rating ?? null,
    hotel_name: stats?.hotel_name ?? hotelName,
  }), [stats, reservations, mergedRooms, hotelName])

  const selectedReservation = useMemo(
    () => managerReservations.find(r => String(r.id) === String(selectedReservationId)) || null,
    [managerReservations, selectedReservationId]
  )

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading manager dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ display: 'flex', paddingTop: '64px' }}>
        {/* Sidebar */}
        <aside style={{ width: '220px', background: '#fff', borderRight: '1px solid #e2e8f0', minHeight: 'calc(100vh - 64px)', padding: '24px 0', position: 'fixed', top: '64px' }}>
          <div style={{ padding: '0 16px 16px', fontWeight: 700, fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hotel Manager
          </div>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px', border: 'none', background: view === item.id ? '#f0fdf4' : 'transparent',
                color: view === item.id ? '#16a34a' : '#374151', cursor: 'pointer', fontSize: '14px',
                fontWeight: view === item.id ? 600 : 400, textAlign: 'left',
              }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ marginLeft: '220px', flex: 1, padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {displayStats.hotel_name || hotelName}
            </h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>
              {hotelCity}{hotelDistrict ? `, ${hotelDistrict}` : ''}
            </p>
          </div>

          {/* Stats */}
          {view === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Reservations', value: displayStats.total_reservations },
                  { label: 'Active Reservations', value: displayStats.active_reservations },
                  { label: 'Total Revenue', value: `EUR ${Number(displayStats.total_revenue).toLocaleString()}` },
                  { label: 'Total Rooms', value: displayStats.total_rooms },
                  { label: 'Available Rooms', value: displayStats.available_rooms },
                  { label: 'Occupancy Rate', value: `${displayStats.occupancy_rate}%` },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{stat.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Recent Reservations</h2>
              {managerReservations.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#6b7280', border: '1px solid #e2e8f0' }}>
                  No reservations found for this hotel.
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Guest', 'Room', 'Check-in', 'Check-out', 'Status', 'Total'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {managerReservations.slice(0, 10).map((res, i) => (
                        <tr key={reservationKey(res)} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontSize: '14px' }}>{reservationGuest(res)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{reservationRoom(res)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{formatDateLabel(res.check_in_date)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{formatDateLabel(res.check_out_date)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600,
                              background: res.status === 'CONFIRMED' ? '#dcfce7' : res.status === 'CANCELLED' ? '#fee2e2' : '#fef9c3',
                              color: res.status === 'CONFIRMED' ? '#16a34a' : res.status === 'CANCELLED' ? '#dc2626' : '#ca8a04'
                            }}>
                              {titleizeStatus(res.status)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600 }}>{formatMoney(res.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {view === 'reservations' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>All Reservations</h2>
              {managerReservations.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#6b7280', border: '1px solid #e2e8f0' }}>
                  No reservations found.
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['ID', 'Guest', 'Room', 'Check-in', 'Check-out', 'Guests', 'Status', 'Total'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {managerReservations.map(res => (
                        <tr key={reservationKey(res)} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>#{res.id}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px' }}>{reservationGuest(res)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{reservationRoom(res)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{formatDateLabel(res.check_in_date)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{formatDateLabel(res.check_out_date)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{res.guest_count || 1}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600,
                              background: res.status === 'CONFIRMED' ? '#dcfce7' : res.status === 'CANCELLED' ? '#fee2e2' : '#fef9c3',
                              color: res.status === 'CONFIRMED' ? '#16a34a' : res.status === 'CANCELLED' ? '#dc2626' : '#ca8a04'
                            }}>
                              {titleizeStatus(res.status)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600 }}>{formatMoney(res.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {view === 'rooms' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Rooms</h2>
              {mergedRooms.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#6b7280', border: '1px solid #e2e8f0' }}>
                  No rooms found for this hotel.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {mergedRooms.map((room, i) => (
                    <div key={roomKey(room)} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <img src={resolveRoomImage(room, i, displayHotel?.img)} alt={roomLabel(room)} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                      <div style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{roomLabel(room)}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>Room #{room.room_number} · Capacity: {room.capacity}</div>
                        <div style={{ fontWeight: 700, color: '#16a34a' }}>EUR {Number(room.price_per_night || 0).toLocaleString()} / night</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'reviews' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Reviews</h2>
              {hotelReviews.reviews.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#6b7280', border: '1px solid #e2e8f0' }}>
                  No reviews yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {hotelReviews.reviews.map((review, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{review.reviewer_name || 'Guest'}</span>
                        <span style={{ background: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>{review.rating}</span>
                      </div>
                      <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'analytics' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Analytics</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Average Rating</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#16a34a' }}>{displayStats.avg_rating ?? '—'}</div>
                </div>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Occupancy Rate</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb' }}>{displayStats.occupancy_rate}%</div>
                </div>
              </div>
            </div>
          )}

          {view === 'settings' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Hotel Settings</h2>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
                {Object.entries(settings).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </label>
                    <input
                      value={value || ''}
                      onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => showToast('Settings saved!')}
                  style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {view === 'media' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Media Gallery</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {buildBaseMediaItems(displayHotel, mergedRooms, hotelName, displayHotel?.img).map((item, i) => (
                  <div key={mediaKey(item, i)} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={item.src} alt={item.label} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px', fontSize: '12px', color: '#6b7280' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
