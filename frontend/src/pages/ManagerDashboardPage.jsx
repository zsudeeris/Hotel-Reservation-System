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
import { createManagerMockData } from '../data/managerMockData.js'

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
  const managerDemo = useMemo(() => createManagerMockData({
    id: effectiveHotelId || hotelId || 18,
    hotel_name: hotelName,
    city: hotelCity || 'Iskele',
    district: hotelDistrict || 'Northern Cyprus',
    img: displayHotel?.img || hotel?.img || '',
  }), [effectiveHotelId, hotelId, hotelName, hotelCity, hotelDistrict, displayHotel?.img, hotel?.img])

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
        const inferredHotelId = Number(hotelId || statsData?.hotel_id || statsData?.hotelId || 0)
        const filteredLiveReservations = reservationList.filter(res => {
          if (user?.role === 'ADMIN') return true
          return Number(res.hotel_id) === inferredHotelId
        })
        const baseReservations = mergeReservationCollections(filteredLiveReservations, managerDemo.reservations).filter(res => {
          if (user?.role === 'ADMIN') return true
          return Number(res.hotel_id) === inferredHotelId
        })
        const hydratedReservations = baseReservations
        const hydratedRooms = managerDemo.rooms

        setStats(statsData || null)
        setReservations(reservationList)
        setManagerReservations(hydratedReservations.length > 0 ? hydratedReservations : managerDemo.reservations)
        setManagerRooms(hydratedRooms.length > 0 ? hydratedRooms : managerDemo.rooms)
        setResolvedHotelId(inferredHotelId || null)

        if (!inferredHotelId) {
          setHotel(null)
          setManagerHotel(getDefaultManagerHotel())
          setHotelReviews({ reviews: [], stats: null })
          setRoomAvailability([])
          setManagerReservations(managerDemo.reservations)
          setManagerRooms(managerDemo.rooms)
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

        const hotelRooms = Array.isArray(hotelData?.rooms) ? hotelData.rooms : []
        const availableRooms = Array.isArray(availabilityData) ? availabilityData : []
        const mergedManagerHotel = {
          hotel_name: hotelData?.hotel_name ?? managerDemo.hotel.hotel_name,
          city: hotelData?.city ?? managerDemo.hotel.city,
          district: hotelData?.district ?? managerDemo.hotel.district,
          description: hotelData?.description ?? managerDemo.hotel.description,
          check_in_time: hotelData?.check_in_time ?? managerDemo.hotel.check_in_time,
          check_out_time: hotelData?.check_out_time ?? managerDemo.hotel.check_out_time,
          img: hotelData?.img || managerDemo.hotel.img,
          score: hotelData?.score ?? null,
        }

        setHotel(hotelData || null)
        setManagerHotel(mergedManagerHotel)
        setHotelReviews({
          reviews: Array.isArray(reviewsData?.reviews) ? reviewsData.reviews : (hotelData?.guest_reviews || []),
          stats: reviewsData?.stats || null,
        })
        setRoomAvailability(availableRooms)
        setManagerRooms(managerDemo.rooms)
        setSettings({
          hotel_name: mergedManagerHotel.hotel_name,
          city: mergedManagerHotel.city,
          district: mergedManagerHotel.district,
          description: mergedManagerHotel.description,
          check_in_time: mergedManagerHotel.check_in_time,
          check_out_time: mergedManagerHotel.check_out_time,
        })

        if (!reservationList.length && !hotelRooms.length) {
          showToast('Hotel data loaded, but no room/reservation records were found for this hotel.')
        }
      } catch (error) {
        if (!active) return
        console.error('Manager dashboard load failed:', error)
        setStats(null)
        setReservations([])
        setManagerReservations(managerDemo.reservations)
        setManagerRooms(managerDemo.rooms)
        setHotel(null)
        setHotelReviews({ reviews: [], stats: null })
        setRoomAvailability([])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [hotelId, hotelName, showToast, user?.role, managerDemo.reservations])

  const mergedRooms = useMemo(() => {
    const availabilityMap = new Map(roomAvailability.map(room => [Number(room.id), room]))
    const baseRooms = managerRooms.length > 0 ? managerRooms : managerDemo.rooms
    return baseRooms.map(room => {
      const available = availabilityMap.get(Number(room.id))
      return {
        ...room,
        available: available?.available !== false,
      }
    })
  }, [roomAvailability, managerRooms, managerDemo.rooms])

  const baseMediaItems = useMemo(
    () => buildBaseMediaItems(displayHotel, mergedRooms, hotelName, hotel?.img),
    [displayHotel, mergedRooms, hotelName, hotel?.img]
  )

  useEffect(() => {
    setMediaGallery(baseMediaItems)
  }, [baseMediaItems])

  const displayReservations = useMemo(() => {
    return managerReservations.length > 0 ? managerReservations : managerDemo.reservations
  }, [managerReservations, managerDemo.reservations])

  const todayKey = useMemo(() => formatDateInput(new Date()), [])
  const dashboardReservations = useMemo(() => displayReservations.filter(res => normalizeStatus(res.status) === 'confirmed'), [displayReservations])

  const liveCheckIns = dashboardReservations.filter(res => (res.check_in_date || res.check_in || '').slice(0, 10) === todayKey).length
  const liveCheckOuts = dashboardReservations.filter(res => (res.check_out_date || res.check_out || '').slice(0, 10) === todayKey).length
  const liveActiveReservations = dashboardReservations.length
  const liveAvailableRooms = mergedRooms.filter(room => room.available !== false).length
  const liveTotalRooms = mergedRooms.length
  const liveRevenue = dashboardReservations.reduce((sum, res) => sum + Number(res.total_price || 0), 0)
  const liveAvgRating = hotelReviews.stats?.average_rating ?? displayHotel?.score

  const todayCheckIns = preferPositive(managerDemo.stats.today_check_ins, preferPositive(stats?.today_check_ins, liveCheckIns))
  const todayCheckOuts = preferPositive(managerDemo.stats.today_check_outs, preferPositive(stats?.today_check_outs, liveCheckOuts))
  const activeReservations = preferPositive(managerDemo.stats.active_reservations, preferPositive(stats?.active_reservations, liveActiveReservations))
  const availableRooms = preferPositive(managerDemo.stats.available_rooms, preferPositive(stats?.available_rooms, liveAvailableRooms))
  const totalRooms = preferPositive(managerDemo.stats.total_rooms, preferPositive(stats?.total_rooms, liveTotalRooms))
  const occupancyRate = preferPositive(managerDemo.stats.occupancy_rate, stats?.occupancy_rate)
  const totalRevenue = preferPositive(managerDemo.stats.total_revenue, preferPositive(stats?.total_revenue, liveRevenue))
  const avgRating = preferPositive(managerDemo.stats.avg_rating, preferPositive(stats?.avg_rating, liveAvgRating))

  const roomTypeCounts = useMemo(() => {
    const counts = new Map()
    displayReservations.forEach(res => {
      const key = res.room_type || res.room_name || 'Room'
      counts.set(key, (counts.get(key) || 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4)
  }, [displayReservations])

  const mostBookedRoom = roomTypeCounts[0]?.label || managerDemo.stats.most_booked_room || 'No bookings yet'
  const analyticsBars = roomTypeCounts.length > 0
    ? roomTypeCounts
    : managerDemo.analytics.roomTypeBreakdown
  const monthlyRevenueBars = managerDemo.analytics.monthlyRevenue
  const statusBars = managerDemo.analytics.statusBreakdown
  const displayReviews = hotelReviews.reviews.length > 0 ? hotelReviews.reviews : managerDemo.reviews
  const selectedReservation = useMemo(
    () => displayReservations.find(res => reservationKey(res) === String(selectedReservationId || '')) || null,
    [displayReservations, selectedReservationId]
  )

  useEffect(() => {
    if (!selectedReservation) {
      setNoteDraft('')
      return
    }
    setNoteDraft(reservationInternalNote(selectedReservation))
  }, [selectedReservation])

  const handleSaveSettings = (e) => {
    e.preventDefault()
    const updatedHotel = {
      ...(managerHotel || {}),
      hotel_name: settings.hotel_name.trim() || hotelName,
      city: settings.city.trim(),
      district: settings.district.trim(),
      description: settings.description.trim(),
      check_in_time: settings.check_in_time.trim() || '14:00',
      check_out_time: settings.check_out_time.trim() || '12:00',
    }
    setManagerHotel(updatedHotel)
    setHotel(prev => prev ? ({ ...prev, ...updatedHotel }) : prev)
    writeStoredManagerHotel(storageKey, updatedHotel)
    showToast('Manager hotel settings saved.')
  }

  const persistReservations = (updater) => {
    setManagerReservations(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      writeStoredManagerReservations(reservationStorageKey, next)
      return next
    })
  }

  const updateReservation = (reservationId, patch) => {
    persistReservations(prev => prev.map(reservation => {
      if (reservationKey(reservation) !== String(reservationId)) return reservation
      return {
        ...reservation,
        ...patch,
      }
    }))
  }

  const openReservationDetails = (reservation) => {
    setSelectedReservationId(reservationKey(reservation))
  }

  const closeReservationDetails = () => {
    setSelectedReservationId(null)
    setCancelTargetId(null)
  }

  const handleReservationAction = (reservation, action) => {
    const id = reservationKey(reservation)
    if (action === 'confirm') {
      updateReservation(id, { status: 'Confirmed' })
      showToast('Reservation confirmed.')
      return
    }
    if (action === 'checkin') {
      updateReservation(id, { status: 'Checked-in' })
      showToast('Reservation marked as checked-in.')
      return
    }
    if (action === 'complete') {
      updateReservation(id, { status: 'Completed' })
      showToast('Reservation marked as completed.')
      return
    }
    if (action === 'cancel') {
      setCancelTargetId(id)
    }
  }

  const handleCancelReservation = () => {
    if (!cancelTargetId) return
    updateReservation(cancelTargetId, { status: 'Cancelled' })
    setCancelTargetId(null)
    showToast('Reservation cancelled.')
  }

  const handleSaveNote = () => {
    if (!selectedReservation) return
    updateReservation(reservationKey(selectedReservation), {
      internal_note: noteDraft.trim(),
    })
    showToast('Internal note saved.')
  }

  const persistRooms = (updater) => {
    setManagerRooms(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      writeStoredManagerRooms(roomStorageKey, next)
      return next
    })
  }

  const normalizeRoomDraft = (room) => ({
    id: room?.id || Date.now(),
    originalId: room?.id || null,
    room_type: room?.room_type || 'Standard Room',
    room_number: room?.room_number || '',
    capacity: room?.capacity || room?.max_guests || 2,
    price_per_night: room?.price_per_night || room?.price || 178.5,
    status: room?.status || (room?.available === false ? 'Occupied' : 'Available'),
    description: room?.description || '',
    amenities: Array.isArray(room?.amenities) ? room.amenities.join(', ') : (room?.amenities || ''),
    img: room?.img || room?.image || displayHotel?.img || hotel?.img || '',
  })

  const openRoomEditor = (room = null, mode = 'edit') => {
    setRoomEditorMode(mode)
    setRoomDraft(normalizeRoomDraft(room))
    setRoomEditorOpen(true)
  }

  const closeRoomEditor = () => {
    setRoomEditorOpen(false)
    setRoomDraft(null)
  }

  const saveRoomDraft = () => {
    if (!roomDraft) return
    const nextRoom = {
      ...roomDraft,
      room_number: roomDraft.room_number ? Number(roomDraft.room_number) : roomDraft.room_number,
      capacity: Number(roomDraft.capacity) || 2,
      price_per_night: Number(roomDraft.price_per_night) || 0,
      status: roomDraft.status || 'Available',
      available: normalizeStatus(roomDraft.status) === 'available',
      amenities: String(roomDraft.amenities || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
    }

    persistRooms(prev => {
      if (roomEditorMode === 'add') {
        return [nextRoom, ...prev]
      }
      return prev.map(room => (Number(room.id) === Number(roomDraft.originalId) ? nextRoom : room))
    })
    setRoomEditorOpen(false)
    setRoomDraft(null)
    showToast(roomEditorMode === 'add' ? 'Room added.' : 'Room updated.')
  }

  const requestDeleteRoom = (room) => {
    setRoomDeleteTarget(room)
  }

  const confirmDeleteRoom = () => {
    if (!roomDeleteTarget) return
    persistRooms(prev => prev.filter(room => roomKey(room) !== roomKey(roomDeleteTarget)))
    setRoomDeleteTarget(null)
    showToast('Room deleted.')
  }

  const persistMedia = (updater) => {
    setMediaGallery(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      writeStoredManagerMedia(mediaStorageKey, next)
      return next
    })
  }

  const openMediaPicker = () => {
    fileInputRef.current?.click()
  }

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (files.length === 0) return

    const validFiles = []
    for (const file of files) {
      const isImage = /^image\/(jpeg|png|webp|jpg)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name)
      if (!isImage) {
        setMediaError('Please upload image files only.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setMediaError('Image size must be under 5MB.')
        return
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return
    setMediaError('')

    const newItems = await Promise.all(validFiles.map(file => new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve({
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        src: String(reader.result || ''),
        label: file.name.replace(/\.[^.]+$/, ''),
        uploaded: true,
      })
      reader.readAsDataURL(file)
    })))

    persistMedia(prev => [...prev, ...newItems])
    showToast('Photos added to gallery.')
  }

  const handleMediaInputChange = (e) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  const handleDropMedia = (e) => {
    e.preventDefault()
    setMediaDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDeleteMediaItem = (itemId) => {
    persistMedia(prev => prev.filter((item, index) => mediaKey(item, index) !== String(itemId)))
  }

  const renderDashboard = () => (
    <>
      <div className="manager-hero">
        <div>
          <div className="section-badge">Hotel Manager</div>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.12, color: 'var(--text)', margin: '8px 0' }}>
            {hotelName}
          </div>
          <div className="manager-subtitle">
            <MapPin style={{ width: 14, height: 14 }} />
            {[hotelCity, hotelDistrict].filter(Boolean).join(' · ') || 'Assigned demo hotel'}
          </div>
        </div>
        <div className="manager-hero-badges">
          <span className="td-badge active">Manager</span>
          <span className="td-badge pending">Hotel ID #{effectiveHotelId || hotelId || '—'}</span>
        </div>
      </div>

      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-lbl">Today’s Check-ins</div>
          <div className="stat-val ok">{todayCheckIns}</div>
          <div className="stat-change">Confirmed arrivals today</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Today’s Check-outs</div>
          <div className="stat-val ok">{todayCheckOuts}</div>
          <div className="stat-change">Departures scheduled today</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Active Reservations</div>
          <div className="stat-val">{activeReservations}</div>
          <div className="stat-change">Hotel-scoped</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Available Rooms</div>
          <div className="stat-val">{availableRooms}</div>
          <div className="stat-change">Out of {totalRooms} active rooms</div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="bottom-card">
          <div className="bottom-card-title">Revenue & Quality</div>
          <div className="bc-row"><span>Total Revenue</span><span>{formatMoney(totalRevenue)}</span></div>
          <div className="bc-row"><span>Occupancy Rate</span><span>{occupancyRate}%</span></div>
          <div className="bc-row"><span>Average Rating</span><span>{avgRating ?? '—'}</span></div>
          <div className="bc-row"><span>Most Booked Room</span><span>{mostBookedRoom}</span></div>
        </div>
        <div className="bottom-card">
          <div className="bottom-card-title">Quick Hotel Snapshot</div>
          <div className="bc-row"><span>Hotel Name</span><span>{hotelName}</span></div>
          <div className="bc-row"><span>City</span><span>{hotelCity || '—'}</span></div>
          <div className="bc-row"><span>District</span><span>{hotelDistrict || '—'}</span></div>
          <div className="bc-row"><span>Description</span><span>{displayHotel?.description ? 'Loaded' : 'Demo data'}</span></div>
        </div>
      </div>

      <div className="activity-card manager-recent-card">
        <div className="activity-title">Recent Reservations</div>
        {displayReservations.length > 0 ? (
          displayReservations.slice(0, 6).map((reservation, index) => (
            <div key={reservation.id || index} className="activity-item">
              <div>
                <div className="act-title">Reservation #{reservation.id}</div>
                <div className="act-sub">
                  {reservationGuest(reservation)} · {reservationRoom(reservation)} · {formatDateLabel(reservation.check_in_date || reservation.check_in)}
                </div>
              </div>
              <span className={`td-badge ${statusBadgeClass(reservation.status)}`}>
                {titleizeStatus(reservation.status)}
              </span>
            </div>
          ))
        ) : (
          <div className="manager-empty">No reservations for this hotel yet.</div>
        )}
      </div>
    </>
  )

  const renderReservations = () => (
    <>
      <div className="table-card">
        <div className="table-card-head">
          <span className="table-card-title">Hotel Reservations ({displayReservations.length})</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Guest</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Room</th>
              <th>Status</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayReservations.length > 0 ? displayReservations.map(res => (
              <tr key={res.id}>
                <td>{res.id}</td>
                <td style={{ fontWeight: 600 }}>{reservationGuest(res)}</td>
                <td>{formatDateLabel(res.check_in_date || res.check_in)}</td>
                <td>{formatDateLabel(res.check_out_date || res.check_out)}</td>
                <td>{reservationRoom(res)}</td>
                <td>
                  <span className={`td-badge ${statusBadgeClass(res.status)}`}>
                    {titleizeStatus(res.status)}
                  </span>
                </td>
                <td>{formatMoney(res.total_price)}</td>
                <td>
                  <button className="td-edit" type="button" onClick={() => openReservationDetails(res)}>
                    <ChevronRight style={{ width: 14, height: 14 }} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '24px 18px', color: 'var(--muted)' }}>
                  No reservations found for this hotel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedReservation ? (
        <div className="manager-drawer-overlay" onClick={closeReservationDetails}>
          <div className="manager-drawer" onClick={e => e.stopPropagation()}>
            <div className="manager-drawer-head">
              <div>
                <div className="manager-drawer-kicker">Reservation Details</div>
                <div className="manager-drawer-title">Booking #{selectedReservation.booking_id || selectedReservation.id}</div>
              </div>
              <button className="manager-drawer-close" type="button" onClick={closeReservationDetails}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div className="manager-drawer-grid">
              <div className="manager-detail-item">
                <span>Guest Name</span>
                <strong>{reservationGuest(selectedReservation)}</strong>
              </div>
              <div className="manager-detail-item">
                <span>Guest Email</span>
                <strong>{selectedReservation.guest_email || '—'}</strong>
              </div>
              <div className="manager-detail-item">
                <span>Check-in</span>
                <strong>{formatDateLabel(selectedReservation.check_in_date || selectedReservation.check_in)}</strong>
              </div>
              <div className="manager-detail-item">
                <span>Check-out</span>
                <strong>{formatDateLabel(selectedReservation.check_out_date || selectedReservation.check_out)}</strong>
              </div>
              <div className="manager-detail-item">
                <span>Room Type</span>
                <strong>{reservationRoom(selectedReservation)}</strong>
              </div>
              <div className="manager-detail-item">
                <span>Guests</span>
                <strong>{selectedReservation.guests || selectedReservation.total_guests || '—'}</strong>
              </div>
              <div className="manager-detail-item">
                <span>Status</span>
                <strong>
                  <span className={`td-badge ${statusBadgeClass(selectedReservation.status)}`} style={{ display: 'inline-flex' }}>
                    {titleizeStatus(selectedReservation.status)}
                  </span>
                </strong>
              </div>
              <div className="manager-detail-item">
                <span>Total Price</span>
                <strong>{formatMoney(selectedReservation.total_price)}</strong>
              </div>
            </div>

            <div className="manager-drawer-block">
              <div className="manager-drawer-section-title">Special Requests</div>
              <div className="manager-drawer-copy">
                {reservationSpecialRequests(selectedReservation) || 'No special requests'}
              </div>
            </div>

            <div className="manager-drawer-block">
              <div className="manager-drawer-section-title">Internal Note</div>
              <textarea
                className="form-inp"
                rows={4}
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                placeholder="Add a private manager note..."
                style={{ resize: 'vertical' }}
              />
              <div className="drawer-actions-row">
                <button className="btn-add" type="button" onClick={handleSaveNote}>Save Note</button>
              </div>
              <div className="manager-drawer-copy" style={{ marginTop: 10 }}>
                {reservationInternalNote(selectedReservation) || 'No internal note yet'}
              </div>
            </div>

            <div className="manager-drawer-block">
              <div className="manager-drawer-section-title">Actions</div>
              <div className="drawer-actions-grid">
                {normalizeStatus(selectedReservation.status) === 'pending' && (
                  <button className="btn-add" type="button" onClick={() => handleReservationAction(selectedReservation, 'confirm')}>
                    Confirm Booking
                  </button>
                )}
                {(normalizeStatus(selectedReservation.status) === 'pending' || normalizeStatus(selectedReservation.status) === 'confirmed') && (
                  <button className="btn-danger" type="button" onClick={() => handleReservationAction(selectedReservation, 'cancel')}>
                    Cancel Reservation
                  </button>
                )}
                {normalizeStatus(selectedReservation.status) === 'confirmed' && (
                  <button className="btn-add" type="button" onClick={() => handleReservationAction(selectedReservation, 'checkin')}>
                    Mark as Checked-in
                  </button>
                )}
                {normalizeStatus(selectedReservation.status) === 'checked-in' && (
                  <button className="btn-add" type="button" onClick={() => handleReservationAction(selectedReservation, 'complete')}>
                    Mark as Completed
                  </button>
                )}
                {normalizeStatus(selectedReservation.status) === 'completed' && (
                  <button className="btn-add" type="button" onClick={() => showToast('Summary is available in the reservation detail panel.')}>
                    View Summary
                  </button>
                )}
                {normalizeStatus(selectedReservation.status) === 'cancelled' && (
                  <div className="manager-empty" style={{ margin: 0 }}>
                    No action available for cancelled reservations.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {cancelTargetId ? (
        <div className="manager-confirm-overlay" onClick={() => setCancelTargetId(null)}>
          <div className="manager-confirm-card" onClick={e => e.stopPropagation()}>
            <div className="manager-drawer-kicker">Confirm Cancellation</div>
            <div className="manager-confirm-title">Are you sure you want to cancel this reservation?</div>
            <div className="manager-confirm-actions">
              <button className="btn-outline" type="button" onClick={() => setCancelTargetId(null)}>Keep Reservation</button>
              <button className="btn-danger" type="button" onClick={handleCancelReservation}>Cancel Reservation</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )

  const renderRooms = () => (
    <>
      <div className="dash-main-title">
        Room Management
        <button className="btn-add" type="button" onClick={() => openRoomEditor(null, 'add')}>
          <Plus style={{ width: 14, height: 14, marginRight: 5 }} />
          Add Room
        </button>
      </div>
      <div className="rooms-grid">
        {mergedRooms.length > 0 ? mergedRooms.map((room, index) => (
          <div key={room.id} className="rm-card">
            <img
              src={resolveRoomImage(room, index, displayHotel?.img || hotel?.img)}
              alt={roomLabel(room)}
              className="rm-img"
              onError={e => { e.currentTarget.src = hotel?.img || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80' }}
            />
            <div className="rm-card-top">
              <div>
                <div className="rm-card-name">{roomLabel(room)}</div>
                <div className="rm-card-count">
                  Room #{room.room_number || room.id} · Up to {room.capacity || room.max_guests || '—'} guests
                </div>
              </div>
              <span className={`rm-badge ${roomStatusClass(room.status || (room.available !== false ? 'Available' : 'Maintenance'))}`}>
                {roomStatusLabel(room.status || (room.available !== false ? 'Available' : 'Maintenance'))}
              </span>
            </div>
            <div className="rm-price">{formatMoney(room.price_per_night)} <span className="per">/night</span></div>
            <div className="room-meta-line">
              {room.description || 'Premium room with hotel-standard amenities.'}
            </div>
            <div className="rm-actions">
              <button className="rm-action" type="button" onClick={() => openRoomEditor(room, 'edit')}>Edit</button>
              <button className="rm-action del" type="button" onClick={() => requestDeleteRoom(room)}>Delete</button>
            </div>
          </div>
        )) : (
          <div className="manager-empty" style={{ gridColumn: '1 / -1' }}>No active rooms were found for this hotel.</div>
        )}
      </div>

      {roomEditorOpen && roomDraft ? (
        <div className="manager-drawer-overlay" onClick={closeRoomEditor}>
          <div className="manager-drawer" onClick={e => e.stopPropagation()}>
            <div className="manager-drawer-head">
              <div>
                <div className="manager-drawer-kicker">{roomEditorMode === 'add' ? 'Add Room' : 'Edit Room'}</div>
                <div className="manager-drawer-title">{roomDraft.room_type || 'Room'}</div>
              </div>
              <button className="manager-drawer-close" type="button" onClick={closeRoomEditor}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div className="manager-drawer-grid">
              <label className="manager-detail-item">
                <span>Room Type</span>
                <input className="form-inp" value={roomDraft.room_type} onChange={e => setRoomDraft(s => ({ ...s, room_type: e.target.value }))} />
              </label>
              <label className="manager-detail-item">
                <span>Room Number</span>
                <input className="form-inp" value={roomDraft.room_number} onChange={e => setRoomDraft(s => ({ ...s, room_number: e.target.value }))} />
              </label>
              <label className="manager-detail-item">
                <span>Capacity</span>
                <input className="form-inp" type="number" min="1" value={roomDraft.capacity} onChange={e => setRoomDraft(s => ({ ...s, capacity: e.target.value }))} />
              </label>
              <label className="manager-detail-item">
                <span>Price per Night</span>
                <input className="form-inp" type="number" min="0" step="0.5" value={roomDraft.price_per_night} onChange={e => setRoomDraft(s => ({ ...s, price_per_night: e.target.value }))} />
              </label>
              <label className="manager-detail-item">
                <span>Status</span>
                <select className="form-inp" value={roomDraft.status} onChange={e => setRoomDraft(s => ({ ...s, status: e.target.value }))}>
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Maintenance</option>
                </select>
              </label>
              <label className="manager-detail-item">
                <span>Image URL</span>
                <input className="form-inp" value={roomDraft.img} onChange={e => setRoomDraft(s => ({ ...s, img: e.target.value }))} />
              </label>
              <label className="manager-detail-item" style={{ gridColumn: '1 / -1' }}>
                <span>Description</span>
                <textarea className="form-inp" rows={3} value={roomDraft.description} onChange={e => setRoomDraft(s => ({ ...s, description: e.target.value }))} />
              </label>
              <label className="manager-detail-item" style={{ gridColumn: '1 / -1' }}>
                <span>Amenities</span>
                <input className="form-inp" value={roomDraft.amenities} onChange={e => setRoomDraft(s => ({ ...s, amenities: e.target.value }))} placeholder="WiFi, AC, TV, Mini Bar" />
              </label>
            </div>

            <div className="manager-confirm-actions">
              <button className="btn-outline" type="button" onClick={closeRoomEditor}>Cancel</button>
              <button className="btn-add" type="button" onClick={saveRoomDraft}>Save Changes</button>
            </div>
          </div>
        </div>
      ) : null}

      {roomDeleteTarget ? (
        <div className="manager-confirm-overlay" onClick={() => setRoomDeleteTarget(null)}>
          <div className="manager-confirm-card" onClick={e => e.stopPropagation()}>
            <div className="manager-drawer-kicker">Delete Room</div>
            <div className="manager-confirm-title">Are you sure you want to delete this room?</div>
            <div className="manager-confirm-actions">
              <button className="btn-outline" type="button" onClick={() => setRoomDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" type="button" onClick={confirmDeleteRoom}>Delete Room</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )

  const renderMedia = () => (
    <>
      <div className="dash-main-title">Hotel Media</div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        hidden
        onChange={handleMediaInputChange}
      />
      <div
        className={`drop-zone media-drop-zone ${mediaDragActive ? 'drag-over' : ''}`}
        onClick={openMediaPicker}
        onDragEnter={() => setMediaDragActive(true)}
        onDragOver={e => { e.preventDefault(); setMediaDragActive(true) }}
        onDragLeave={() => setMediaDragActive(false)}
        onDrop={handleDropMedia}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openMediaPicker()
          }
        }}
      >
        <div className="drop-ico">📷</div>
        <div className="drop-title">Upload Hotel Photos</div>
        <div className="drop-sub">Drag & drop images here, or click to select files</div>
      </div>
      <div className="media-section-head">
        <div>
          <div className="media-section-title">Gallery</div>
          <div className="media-section-subtitle">Manage the hotel photos displayed in the gallery.</div>
        </div>
      </div>
      {mediaError ? <div className="field-error" style={{ marginBottom: 10 }}>{mediaError}</div> : null}
      <div className="media-grid media-gallery-grid">
        {mediaGallery.length > 0 ? mediaGallery.map((item, index) => (
          <div key={`${mediaKey(item, index)}`} className="media-tile">
            <img
              src={item.src}
              alt={item.label || `Hotel media ${index + 1}`}
              onError={e => { e.currentTarget.src = hotel?.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80' }}
            />
            <button
              className="media-remove"
              type="button"
              onClick={() => handleDeleteMediaItem(mediaKey(item, index))}
              aria-label="Remove image"
            >
              <Trash2 style={{ width: 14, height: 14 }} />
              <span>Remove</span>
            </button>
          </div>
        )) : (
          <div className="manager-empty" style={{ gridColumn: '1 / -1' }}>No media items available for this hotel.</div>
        )}
      </div>
    </>
  )

  const renderReviews = () => (
    <>
      <div className="dash-main-title">Reviews</div>
      <div className="activity-card">
        <div className="activity-title">Recent Reviews</div>
        {displayReviews.length > 0 ? displayReviews.map((review, index) => (
          <div key={`${review.id || index}`} className="activity-item" style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="act-title">{review.reviewer_name || 'Guest'}</div>
              <div className="act-sub">{review.comment}</div>
              <div className="act-sub" style={{ marginTop: 6 }}>
                {formatDateLabel(review.created_at)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span className="td-badge active">{review.rating} / 10</span>
            </div>
          </div>
        )) : (
          <div className="manager-empty">No reviews yet.</div>
        )}
      </div>
    </>
  )

  const renderAnalytics = () => (
    <>
      <div className="dash-main-title">Analytics</div>
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-lbl">Revenue</div>
          <div className="stat-val ok">{formatMoney(totalRevenue)}</div>
          <div className="stat-change">Hotel-scoped revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Occupancy Rate</div>
          <div className="stat-val">{occupancyRate}%</div>
          <div className="stat-change">Current snapshot</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Average Rating</div>
          <div className="stat-val ok">{avgRating ?? '—'}</div>
          <div className="stat-change">Guest score</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Most Booked Room</div>
          <div className="stat-val" style={{ fontSize: 24 }}>{mostBookedRoom}</div>
          <div className="stat-change">Based on reservations</div>
        </div>
      </div>

      <div className="stats-grid-4" style={{ marginTop: 20 }}>
        <div className="stat-card">
          <div className="stat-lbl">Monthly Revenue</div>
          <div className="stat-val ok">{formatMoney(managerDemo.stats.total_revenue)}</div>
          <div className="stat-change">Demo monthly snapshot</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Cancellation Rate</div>
          <div className="stat-val">{managerDemo.stats.cancellation_rate}%</div>
          <div className="stat-change">Healthy booking flow</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Guest Satisfaction</div>
          <div className="stat-val ok">{managerDemo.stats.guest_satisfaction}%</div>
          <div className="stat-change">Based on recent reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Average Daily Rate</div>
          <div className="stat-val">{formatMoney(managerDemo.stats.average_daily_rate)}</div>
          <div className="stat-change">Per occupied room</div>
        </div>
      </div>

      <div className="bottom-grid" style={{ marginTop: 20 }}>
        <div className="chart-card">
          <div className="chart-card-title">Monthly Revenue Trend</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, padding: '0 10px' }}>
            {monthlyRevenueBars.map(bar => {
              const maxValue = Math.max(...monthlyRevenueBars.map(item => item.revenue))
              const height = maxValue ? (bar.revenue / maxValue) * 140 : 20
              return (
                <div key={bar.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>{formatMoney(bar.revenue)}</div>
                  <div style={{ width: '100%', background: 'var(--green)', borderRadius: '4px 4px 0 0', height: `${Math.max(height, 24)}px`, transition: 'height .3s' }} />
                  <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>{bar.month}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Bookings by Room Type</div>
          <div className="room-type-chart">
            {analyticsBars.map(bar => {
              const maxValue = Math.max(...analyticsBars.map(item => item.value))
              const width = maxValue ? (bar.value / maxValue) * 100 : 0
              return (
                <div key={bar.label} className="room-type-chart-row">
                  <div className="room-type-chart-head">
                    <span className="room-type-chart-label">{bar.label}</span>
                    <span className="room-type-chart-value">{bar.value}</span>
                  </div>
                  <div className="room-type-chart-track">
                    <div
                      className="room-type-chart-bar"
                      style={{ width: `${Math.max(width, 12)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Reservation Status Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '6px 2px 0' }}>
            {statusBars.map(item => {
              const maxValue = Math.max(...statusBars.map(entry => entry.value))
              const width = maxValue ? (item.value / maxValue) * 100 : 0
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--text)' }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 700 }}>{item.value}</span>
                  </div>
                  <div style={{ height: 10, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(width, 12)}%`, height: '100%', background: 'var(--green)', borderRadius: 999 }} />
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
      <form className="activity-card" onSubmit={handleSaveSettings}>
        <div className="activity-title">Hotel Information</div>
        <div className="settings-grid">
          <label className="settings-field">
            <span>Hotel Name</span>
            <input className="form-inp" value={settings.hotel_name} onChange={e => setSettings(s => ({ ...s, hotel_name: e.target.value }))} />
          </label>
          <label className="settings-field">
            <span>City</span>
            <input className="form-inp" value={settings.city} onChange={e => setSettings(s => ({ ...s, city: e.target.value }))} />
          </label>
          <label className="settings-field">
            <span>District</span>
            <input className="form-inp" value={settings.district} onChange={e => setSettings(s => ({ ...s, district: e.target.value }))} />
          </label>
          <label className="settings-field">
            <span>Check-in Time</span>
            <input className="form-inp" value={settings.check_in_time} onChange={e => setSettings(s => ({ ...s, check_in_time: e.target.value }))} />
          </label>
          <label className="settings-field">
            <span>Check-out Time</span>
            <input className="form-inp" value={settings.check_out_time} onChange={e => setSettings(s => ({ ...s, check_out_time: e.target.value }))} />
          </label>
          <label className="settings-field" style={{ gridColumn: '1 / -1' }}>
            <span>Description</span>
            <textarea
              className="form-inp"
              rows={4}
              value={settings.description}
              onChange={e => setSettings(s => ({ ...s, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </label>
        </div>
        <button className="btn-add" type="submit" style={{ marginTop: 12 }}>Save Changes</button>
      </form>
    </>
  )

  const contentByView = {
    dashboard: renderDashboard,
    reservations: renderReservations,
    rooms: renderRooms,
    media: renderMedia,
    reviews: renderReviews,
    analytics: renderAnalytics,
    settings: renderSettings,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar staffMeta={{ roleLabel: 'Hotel Manager', hotelName: hotelName }} />
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">
            <LayoutDashboard style={{ width: 20, height: 20, stroke: 'var(--green)' }} />
            Manager Panel
          </div>
          <nav className="snav">
            {NAV.map(item => (
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
          {loading ? (
            <div className="page-loading" style={{ minHeight: 320 }}>Loading hotel dashboard...</div>
          ) : effectiveHotelId ? (
            contentByView[view]?.() || null
          ) : (
            <div className="activity-card">
              <div className="activity-title">No hotel is assigned to this staff account.</div>
              <div className="manager-empty">Assign a `hotel_id` to the manager account to load hotel data.</div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
