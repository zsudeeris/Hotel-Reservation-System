import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Heart, MapPin, Minus, Plus, Star } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import LandingNavbar from '../components/LandingNavbar.jsx'
import SearchBar from '../components/SearchBar.jsx'
import AvailableRooms from '../components/AvailableRooms.jsx'
import { getHotel, getHotelReviews, getHotelRooms } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useBooking } from '../context/BookingContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import {
  buildRoomSelection,
  getNights,
  getRoomCapacity,
  getRoomGuestCount,
  getRoomNightlyPrice,
  roomPlanTotals,
} from '../utils/bookingState.js'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80',
]

function toList(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean)
  }
  return []
}

function money(value) {
  return `EUR ${Number(value || 0).toFixed(0)}`
}

function hotelName(hotel) {
  return hotel?.hotel_name || hotel?.name || 'Hotel'
}

function hotelLocation(hotel) {
  return [hotel?.city, hotel?.district].filter(Boolean).join(', ') || 'Northern Cyprus'
}

function normalizeRoom(room) {
  if (!room) return null
  return {
    ...room,
    id: room.id,
    room_type: room.room_type || room.name || 'Room',
    capacity: getRoomCapacity(room),
    price_per_night: getRoomNightlyPrice(room),
    amenities: toList(room.amenities),
    image_url: room.image_url || room.image || room.img || FALLBACK_IMAGES[2],
    description: room.description || 'A comfortable room with essential hotel amenities.',
  }
}

function normalizeHotel(raw) {
  if (!raw) return null
  return {
    ...raw,
    id: raw.id,
    hotel_name: raw.hotel_name || raw.name || 'Hotel',
    city: raw.city || '',
    district: raw.district || '',
    stars: Number(raw.stars || 5),
    score: Number(raw.score || 0),
    review_count: Number(raw.review_count || 0),
    description: raw.description || '',
    amenities: toList(raw.amenities),
    rooms: toList(raw.rooms).map(normalizeRoom).filter(Boolean),
    images: toList(raw.images),
    image_url: raw.image_url || raw.img || FALLBACK_IMAGES[0],
    guest_reviews: toList(raw.guest_reviews),
  }
}

function readSearchDefaults(search) {
  const params = new URLSearchParams(search)
  let stored = {}
  try {
    stored = JSON.parse(window.sessionStorage.getItem('bookhotel:lastSearch') || '{}')
  } catch {}

  return {
    q: params.get('q') || stored.q || '',
    checkin: params.get('checkin') || stored.checkin || '',
    checkout: params.get('checkout') || stored.checkout || '',
    adults: params.get('adults') || stored.adults || '',
    children: params.get('children') || stored.children || '',
    rooms: params.get('rooms') || stored.rooms || '',
    guestTouched: params.get('guestTouched') || stored.guestTouched || '',
  }
}

function makeGuestRooms(roomCount = 1, adultCount = 2, childCount = 0) {
  const count = Math.max(1, Number.parseInt(roomCount, 10) || 1)
  const adults = Math.max(count, Number.parseInt(adultCount, 10) || 2)
  let children = Math.max(0, Number.parseInt(childCount, 10) || 0)
  const rooms = Array.from({ length: count }, (_, index) => ({ id: `room-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, adults: 1, children: 0 }))

  let remainingAdults = adults - count
  let index = 0
  while (remainingAdults > 0) {
    rooms[index % count].adults += 1
    index += 1
    remainingAdults -= 1
  }

  index = 0
  while (children > 0) {
    rooms[index % count].children += 1
    index += 1
    children -= 1
  }

  return rooms
}

function buildGallery(hotel) {
  const images = [hotel?.image_url, ...toList(hotel?.images), ...FALLBACK_IMAGES].filter(Boolean)
  return images.slice(0, 3)
}

function ratingLabel(score) {
  if (!score) return 'No reviews yet'
  if (score >= 9) return 'Exceptional'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Very Good'
  return 'Good'
}

function DateCalendar({ month, setMonth, checkin, checkout, onPick }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const firstDay = new Date(month.year, month.month, 1).getDay()
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate()

  return (
    <>
      <div className="cal-nav-row">
        <button
          className="cal-nav-btn"
          type="button"
          onClick={() => setMonth(value => {
            const next = new Date(value.year, value.month - 1, 1)
            return { year: next.getFullYear(), month: next.getMonth() }
          })}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </button>
        <span className="cal-month-lbl">
          {new Date(month.year, month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          className="cal-nav-btn"
          type="button"
          onClick={() => setMonth(value => {
            const next = new Date(value.year, value.month + 1, 1)
            return { year: next.getFullYear(), month: next.getMonth() }
          })}
        >
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <div className="cal-grid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day} className="cal-dh">{day}</div>)}
        {Array.from({ length: firstDay }).map((_, index) => <div key={`blank-${index}`} className="cal-d other" />)}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const date = new Date(month.year, month.month, day)
          const dateStr = `${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isPast = date < today
          const selected = dateStr === checkin || dateStr === checkout
          const inRange = checkin && checkout && date > new Date(checkin) && date < new Date(checkout)
          const isToday = date.toDateString() === today.toDateString()

          return (
            <button
              key={dateStr}
              type="button"
              className={`cal-d${isPast ? ' other' : ''}${selected ? ' selected' : ''}${inRange ? ' in-range' : ''}${isToday && !selected ? ' today' : ''}`}
              disabled={isPast}
              onClick={() => onPick(dateStr)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </>
  )
}

function StateCard({ user, status, message, onRetry, onHome }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {user ? <Navbar /> : <div className="search-topbar"><LandingNavbar /></div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '72px 24px' }}>
        <div style={{ width: '100%', maxWidth: 560, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: 'var(--shadow-lg)', padding: 28, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 10, color: 'var(--text)' }}>{status}</h1>
          <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 22 }}>{message}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {onRetry && <button className="btn-view-rooms" type="button" onClick={onRetry}>Retry</button>}
            <button className="btn-cf-outline" type="button" onClick={onHome}>Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { toggle, isFavorite } = useWishlist()
  const {
    setHotel: setBookingHotel,
    setRoom,
    setDates,
    setGuests,
    setRoomPlans,
    setRoomSelections: setBookingRoomSelections,
    setReservationId,
    setTotalPrice,
  } = useBooking()

  const defaults = useMemo(() => readSearchDefaults(location.search), [location.search])
  const [hotel, setHotelData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ average_rating: null, review_count: 0 })
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [checkin, setCheckin] = useState(defaults.checkin || '')
  const [checkout, setCheckout] = useState(defaults.checkout || '')
  const [dateMode, setDateMode] = useState(defaults.checkin && !defaults.checkout ? 'checkout' : 'checkin')
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const start = defaults.checkin ? new Date(defaults.checkin) : new Date()
    return { year: start.getFullYear(), month: start.getMonth() }
  })
  const [guestRooms, setGuestRooms] = useState(() => makeGuestRooms(defaults.rooms, defaults.adults, defaults.children))
  const [roomSelections, setRoomSelections] = useState(() => makeGuestRooms(defaults.rooms, defaults.adults, defaults.children).map(() => null))
  const [availableRoomsByPlan, setAvailableRoomsByPlan] = useState([])
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    let alive = true
    setStatus('loading')
    setError('')
    setHotelData(null)
    setReviews([])
    setReviewStats({ average_rating: null, review_count: 0 })

    getHotel(id)
      .then(data => {
        if (!alive) return
        const nextHotel = normalizeHotel(data)
        if (!nextHotel?.id) {
          setStatus('notfound')
          return
        }
        setHotelData(nextHotel)
        setStatus('ready')
      })
      .catch(err => {
        if (!alive) return
        if (err?.status === 404) {
          setStatus('notfound')
          return
        }
        setError('Unable to load hotel details. Please try again.')
        setStatus('error')
      })

    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    if (!hotel?.id) return
    setBookingHotel(hotel)
    setRoom(null)
    setDates({ checkin: checkin || null, checkout: checkout || null })
    setGuests(roomPlanTotals(guestRooms))
    setRoomPlans(guestRooms)
    setReservationId(null)
    setTotalPrice(0)
    setRoomSelections(guestRooms.map(() => null))
    setBookingRoomSelections(guestRooms.map(() => null))
    setExpanded(false)
    setShowAllReviews(false)
  }, [hotel?.id])

  useEffect(() => {
    if (!hotel?.id) return
    if (!checkin || !checkout || checkout <= checkin) {
      setAvailableRoomsByPlan([])
      return
    }

    let alive = true
    Promise.all(
      guestRooms.map(async roomPlan => {
        const guests = getRoomGuestCount(roomPlan)
        try {
          const roomsForPlan = await getHotelRooms(hotel.id, {
            checkin,
            checkout,
            guest_count: guests,
          })
          return Array.isArray(roomsForPlan) ? roomsForPlan.map(normalizeRoom).filter(Boolean) : []
        } catch {
          return []
        }
      })
    ).then(results => {
      if (alive) setAvailableRoomsByPlan(results)
    })

    return () => {
      alive = false
    }
  }, [hotel?.id, checkin, checkout, guestRooms])

  useEffect(() => {
    if (!hotel?.id) return
    let alive = true
    getHotelReviews(hotel.id)
      .then(data => {
        if (!alive) return
        const list = Array.isArray(data?.reviews) ? data.reviews : hotel.guest_reviews
        setReviews(list || [])
        setReviewStats(data?.stats || {
          average_rating: list?.length ? list.reduce((sum, item) => sum + Number(item.rating || 0), 0) / list.length : null,
          review_count: list?.length || 0,
        })
      })
      .catch(() => {
        if (!alive) return
        setReviews(hotel.guest_reviews || [])
        setReviewStats({
          average_rating: hotel.guest_reviews?.length ? hotel.guest_reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / hotel.guest_reviews.length : null,
          review_count: hotel.guest_reviews?.length || 0,
        })
      })
    return () => {
      alive = false
    }
  }, [hotel?.id])

  useEffect(() => {
    setDates({ checkin: checkin || null, checkout: checkout || null })
  }, [checkin, checkout, setDates])

  useEffect(() => {
    setGuests(roomPlanTotals(guestRooms))
    setRoomPlans(guestRooms)
    setRoomSelections(current => guestRooms.map((roomPlan, index) => {
      const selection = current[index] || null
      if (!selection?.room) return null
      return getRoomCapacity(selection.room) >= getRoomGuestCount(roomPlan) ? selection : null
    }))
  }, [guestRooms, hotel?.rooms, setGuests, setRoomPlans])

  useEffect(() => {
    if (!hotel?.id) return
    setRoomSelections(current => guestRooms.map((roomPlan, index) => {
      const selection = current[index] || null
      if (!selection?.room) return null
      const inventory = availableRoomsByPlan[index]?.length ? availableRoomsByPlan[index] : (hotel.rooms || [])
      const matchedRoom = inventory.find(room => String(room.id) === String(selection.room.id))
      if (!matchedRoom || matchedRoom.available === false) return null
      return getRoomCapacity(matchedRoom) >= getRoomGuestCount(roomPlan)
        ? buildRoomSelection(matchedRoom, roomPlan, index, roomPlan.id)
        : null
    }))
  }, [availableRoomsByPlan, guestRooms, hotel?.id])

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {user ? <Navbar /> : <div className="search-topbar"><LandingNavbar /></div>}
        <div className="page-loading">Loading hotel details...</div>
      </div>
    )
  }

  if (status === 'notfound') {
    return (
      <StateCard
        user={user}
        status="Hotel not found."
        message="The hotel you requested does not exist or is no longer available."
        onHome={() => navigate('/')}
      />
    )
  }

  if (status === 'error') {
    return (
      <StateCard
        user={user}
        status="Unable to load hotel details."
        message={error || 'Please try again.'}
        onRetry={() => window.location.reload()}
        onHome={() => navigate('/')}
      />
    )
  }

  const totals = roomPlanTotals(guestRooms)
  const stayNights = getNights(checkin, checkout)
  const hasValidDates = Boolean(checkin && checkout && checkout > checkin)
  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : []
  const resolvedSelections = guestRooms.map((roomPlan, index) => {
    const selected = roomSelections[index]
    const guests = getRoomGuestCount(roomPlan)
    if (!selected?.room) return null
    const inventory = availableRoomsByPlan[index]?.length ? availableRoomsByPlan[index] : rooms
    const matchedRoom = inventory.find(room => String(room.id) === String(selected.room.id))
    if (!matchedRoom || matchedRoom.available === false) return null
    if (getRoomCapacity(matchedRoom) < guests) return null
    return buildRoomSelection(matchedRoom, roomPlan, index, roomPlan.id)
  })
  const selectionErrors = guestRooms.map((roomPlan, index) => {
    const selected = roomSelections[index]
    const guests = getRoomGuestCount(roomPlan)
    const inventory = availableRoomsByPlan[index]?.length ? availableRoomsByPlan[index] : rooms
    const matchedRoom = selected?.room ? inventory.find(room => String(room.id) === String(selected.room.id)) : null
    if (!selected?.room) return `Room ${index + 1}: Room type required`
    if (!matchedRoom || matchedRoom.available === false) return `Room ${index + 1}: Selected room is not available for these dates.`
    if (getRoomCapacity(matchedRoom) < guests) return `Room ${index + 1}: Selected room no longer fits ${guests} guest${guests !== 1 ? 's' : ''}.`
    return ''
  })
  const firstSelectionIssue = selectionErrors.findIndex(Boolean)
  const hasAllRoomSelections = firstSelectionIssue === -1
  const roomTotal = hasValidDates && hasAllRoomSelections
    ? resolvedSelections.reduce((sum, selection) => sum + (getRoomNightlyPrice(selection.room) * stayNights), 0)
    : 0
  const gallery = buildGallery(hotel)
  const amenities = toList(hotel.amenities)
  const description = hotel.description || `${hotelName(hotel)} offers a comfortable premium stay in ${hotelLocation(hotel)} with practical facilities for leisure and business guests.`
  const rating = reviewStats.average_rating ?? (reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length : hotel.score)
  const reviewCount = Number(reviewStats.review_count || reviews.length || hotel.review_count || 0)
  const saved = Boolean(user && isFavorite(hotel.id))
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3)
  const roomSelectionSummary = resolvedSelections.map((selection, index) => {
    const plan = guestRooms[index]
    return {
      index,
      plan,
      selection,
      guests: getRoomGuestCount(plan),
      selectedName: selection?.room?.room_type || selection?.roomType || '',
      pricePerNight: selection?.room ? getRoomNightlyPrice(selection.room) : 0,
    }
  })
  const totalLabel = !hasValidDates
    ? 'Select dates to see total'
    : !hasAllRoomSelections
      ? 'Select a room type for each room to see total'
      : money(roomTotal)
  const continueLabel = !hasValidDates
    ? 'Select dates first'
    : !hasAllRoomSelections
      ? 'Select room types'
      : 'Continue to Booking'

  const pickDate = (dateStr) => {
    setBookingError('')
    if (dateMode === 'checkin') {
      setCheckin(dateStr)
      setCheckout('')
      setDateMode('checkout')
      return
    }
    if (!checkin || dateStr <= checkin) {
      setCheckin(dateStr)
      setCheckout('')
      setDateMode('checkout')
      return
    }
    setCheckout(dateStr)
    setDateMode('checkin')
  }

  const updateGuestRoom = (index, key, delta) => {
    setBookingError('')
    setGuestRooms(current => current.map((room, roomIndex) => {
      if (roomIndex !== index) return room
      return {
        ...room,
        [key]: key === 'adults'
          ? Math.max(1, Number(room[key] || 1) + delta)
          : Math.max(0, Number(room[key] || 0) + delta),
      }
    }))
  }

  const addRoom = () => {
    const lastIndex = guestRooms.length - 1
    const lastSelection = roomSelections[lastIndex]
    if (!lastSelection?.room) {
      setBookingError(`Please select a room type for Room ${lastIndex + 1} before adding another room.`)
      return
    }
    setBookingError('')
    setGuestRooms(current => [...current, { id: `room-${current.length + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, adults: 1, children: 0 }])
    setRoomSelections(current => [...current, null])
  }

  const removeRoom = (index) => {
    setBookingError('')
    setGuestRooms(current => current.length <= 1 ? current : current.filter((_, roomIndex) => roomIndex !== index))
    setRoomSelections(current => current.length <= 1 ? current : current.filter((_, roomIndex) => roomIndex !== index))
  }

  const saveHotel = () => {
    if (!user) {
      navigate('/login')
      return
    }
    toggle(hotel)
  }

  const continueToBooking = () => {
    if (!hasValidDates) {
      setBookingError('Please select check-in and check-out dates before booking.')
      return
    }
    const invalidIndex = roomSelections.findIndex((selection, index) => {
      const plan = guestRooms[index]
      const guests = getRoomGuestCount(plan)
      const inventory = availableRoomsByPlan[index]?.length ? availableRoomsByPlan[index] : rooms
      const matchedRoom = selection?.room ? inventory.find(room => String(room.id) === String(selection.room.id)) : null
      return !matchedRoom || matchedRoom.available === false || getRoomCapacity(matchedRoom) < guests
    })
    if (invalidIndex >= 0) {
      setBookingError('Selected room is not available for these dates.')
      return
    }

    const selections = guestRooms.map((roomPlan, index) => {
      const inventory = availableRoomsByPlan[index]?.length ? availableRoomsByPlan[index] : rooms
      const matchedRoom = inventory.find(room => String(room.id) === String(roomSelections[index].room.id))
      return buildRoomSelection(matchedRoom, roomPlan, index, roomPlan.id)
    })
    const total = selections.reduce((sum, selection) => sum + (getRoomNightlyPrice(selection.room) * stayNights), 0)
    setBookingHotel(hotel)
    setRoom(selections[0]?.room || null)
    setDates({ checkin, checkout })
    setGuests(totals)
    setRoomPlans(guestRooms)
    setBookingRoomSelections(selections)
    setTotalPrice(total)
    setBookingError('')
    navigate('/booking')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {user ? <Navbar /> : <div className="search-topbar"><LandingNavbar /></div>}
      <SearchBar variant="detail" initialValues={defaults} />

      <main className="detail-content" style={{ maxWidth: 1380, margin: '0 auto' }}>
        <section style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <span className="amenity-tag"><MapPin style={{ width: 13, height: 13 }} />{hotelLocation(hotel)}</span>
              <span className="amenity-tag"><Star style={{ width: 13, height: 13 }} />{hotel.stars} Star Hotel</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--green)', color: '#fff', borderRadius: 999, padding: '7px 13px', fontSize: 12, fontWeight: 700 }}>
                {reviewCount ? `${Number(rating || 0).toFixed(1)} · ${ratingLabel(rating)}` : 'No reviews yet'}
              </span>
            </div>
            <h1 className="detail-hotel-name">{hotelName(hotel)}</h1>
            <div className="detail-hotel-loc">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</div>
          </div>

          <button
            type="button"
            onClick={saveHotel}
            style={{
              background: saved ? 'var(--green-light)' : 'var(--white)',
              border: '1.5px solid var(--border)',
              borderRadius: 12,
              padding: '11px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              color: saved ? 'var(--green-dark)' : 'var(--sub)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Heart style={{ width: 16, height: 16, fill: saved ? 'var(--green-dark)' : 'none' }} />
            {saved ? 'Saved' : 'Save'}
          </button>
        </section>

        <section className="detail-gallery">
          <div className="gal-main">
            <img src={gallery[0]} alt={hotelName(hotel)} onError={event => { event.currentTarget.src = FALLBACK_IMAGES[0] }} />
          </div>
          <div className="gal-side">
            {gallery.slice(1, 3).map((image, index) => (
              <div className="gal-side-item" key={`${image}-${index}`}>
                <img src={image} alt={`${hotelName(hotel)} ${index + 2}`} onError={event => { event.currentTarget.src = FALLBACK_IMAGES[index + 1] }} />
              </div>
            ))}
          </div>
        </section>

        <section className="detail-grid">
          <div style={{ display: 'grid', gap: 24 }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="rooms-sec-title" style={{ marginTop: 0 }}>Overview</h2>
              <p className={`detail-desc ${description.length > 260 && !expanded ? 'collapsed' : ''}`}>{description}</p>
              {description.length > 260 && (
                <button className="see-more-btn" type="button" onClick={() => setExpanded(value => !value)}>
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}

              <div className="amenity-tags">
                {(amenities.length ? amenities : ['Comfortable stay', 'Clean rooms', 'Guest services']).slice(0, 12).map((item, index) => (
                  <span className="amenity-tag" key={`${item}-${index}`}>{item}</span>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="rooms-sec-title" style={{ marginTop: 0 }}>Available Rooms</h2>
              <p style={{ color: 'var(--sub)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                Select a room type for each room. A room only becomes valid when the chosen type fits that room&apos;s guest count.
              </p>

              <AvailableRooms
                rooms={rooms}
                roomsByPlan={availableRoomsByPlan}
                roomPlans={guestRooms}
                roomSelections={roomSelections}
                selectionErrors={selectionErrors}
                nights={stayNights}
                onSelectRoom={(index, room) => {
                  setBookingError('')
                  setRoomSelections(current => current.map((selection, selectionIndex) => (
                    selectionIndex === index
                      ? buildRoomSelection(room, guestRooms[index], index, guestRooms[index]?.id)
                      : selection
                  )))
                }}
              />
            </div>

            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <div>
                  <h2 className="rooms-sec-title" style={{ margin: 0 }}>Guest Reviews</h2>
                  <div style={{ color: 'var(--sub)', fontSize: 13 }}>{reviewCount ? `${Number(rating || 0).toFixed(1)} · ${ratingLabel(rating)} · ${reviewCount} reviews` : 'No reviews yet'}</div>
                </div>
                <div className="detail-score-badge">{reviewCount ? Number(rating || 0).toFixed(1) : '-'}</div>
              </div>

              {visibleReviews.length ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {visibleReviews.map((review, index) => (
                    <div key={`${review.reviewer_name || 'guest'}-${index}`} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                        <strong style={{ fontSize: 13 }}>{review.reviewer_name || 'Guest'}</strong>
                        <span style={{ background: 'var(--green)', color: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{Number(review.rating || 0).toFixed(1)}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.55 }}>{review.comment || 'A pleasant stay.'}</div>
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <button className="detail-comments-link" type="button" onClick={() => setShowAllReviews(value => !value)}>
                      {showAllReviews ? 'Hide Reviews' : 'See All Reviews'}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, color: 'var(--sub)', fontSize: 13 }}>No reviews yet.</div>
              )}
            </div>
          </div>

          <aside className="booking-side">
            <div className="booking-side-title">
              <Check style={{ width: 14, height: 14, stroke: 'var(--green)' }} />
              Plan Your Stay
            </div>
            <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 12, marginBottom: 12 }}>
              {dateMode === 'checkin' ? 'Select check-in date' : 'Select check-out date'}
            </div>
            {bookingError && <div className="ferr show" style={{ display: 'block', marginBottom: 10 }}>{bookingError}</div>}

            <DateCalendar month={calendarMonth} setMonth={setCalendarMonth} checkin={checkin} checkout={checkout} onPick={pickDate} />

            <div style={{ display: 'grid', gap: 7, padding: '13px 0', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)', marginTop: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span style={{ color: 'var(--sub)' }}>Check-in</span><strong>{checkin || 'Not set'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span style={{ color: 'var(--sub)' }}>Check-out</span><strong>{checkout || 'Not set'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span style={{ color: 'var(--sub)' }}>Stay</span><strong>{hasValidDates ? `${stayNights} night${stayNights !== 1 ? 's' : ''}` : 'Select dates'}</strong></div>
            </div>

            <div className="detail-rooms-box" style={{ marginTop: 14 }}>
              <div className="detail-rooms-head">
                <div className="detail-rooms-copy">
                  <div className="detail-rooms-title">Rooms &amp; Guests</div>
                  <div className="detail-rooms-sub">{totals.roomCount} room{totals.roomCount !== 1 ? 's' : ''} · {totals.totalGuests} guest{totals.totalGuests !== 1 ? 's' : ''}</div>
                </div>
                <button className="mini-action detail-rooms-add-btn" type="button" onClick={addRoom}>Add Room</button>
              </div>

              <div className="detail-rooms-list">
                {guestRooms.map((room, index) => (
                  <div className="detail-room-card" key={`guest-room-${index}`}>
                    <div className="detail-room-card-head">
                      <strong>Room {index + 1}</strong>
                      {guestRooms.length > 1 && <button className="detail-room-remove" type="button" onClick={() => removeRoom(index)}>Remove</button>}
                    </div>
                    <div className="detail-room-controls detail-room-controls--compact">
                      {['adults', 'children'].map(key => (
                        <div className="detail-room-control detail-room-control--stacked" key={key}>
                          <span>{key === 'adults' ? 'Adults' : 'Children'}</span>
                          <div className="detail-room-stepper">
                            <button type="button" onClick={() => updateGuestRoom(index, key, -1)} aria-label={`Decrease ${key}`}>
                              <Minus style={{ width: 12, height: 12 }} />
                            </button>
                            <strong>{room[key]}</strong>
                            <button type="button" onClick={() => updateGuestRoom(index, key, 1)} aria-label={`Increase ${key}`}>
                              <Plus style={{ width: 12, height: 12 }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 8, marginTop: 14, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Selected Rooms</div>
              {roomSelectionSummary.map(item => (
                <div key={`selected-room-${item.index}`} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'grid', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <strong>Room {item.index + 1}</strong>
                    <span style={{ color: item.selection?.room ? 'var(--green)' : 'var(--red)', fontSize: 12, fontWeight: 700 }}>
                      {item.selection?.room ? item.selectedName : 'Room type required'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--sub)', fontSize: 12.5 }}>
                    {item.plan.adults} adult{item.plan.adults !== 1 ? 's' : ''}{item.plan.children ? `, ${item.plan.children} child${item.plan.children !== 1 ? 'ren' : ''}` : ''}
                  </div>
                  <div style={{ color: 'var(--sub)', fontSize: 12.5 }}>
                    {item.selection?.room ? `${money(item.pricePerNight)}/night` : 'Select a room type to continue'}
                  </div>
                </div>
              ))}
            </div>

            <div className="price-total-line">
              <span className="price-total-lbl">Total</span>
              <span className="price-total-val">{totalLabel}</span>
            </div>

            {firstSelectionIssue >= 0 && (
              <div className="ferr show" style={{ display: 'block', marginBottom: 10 }}>
                {selectionErrors[firstSelectionIssue]}
              </div>
            )}

            <button className="btn-proceed" type="button" onClick={continueToBooking}>
              {continueLabel}
            </button>
          </aside>
        </section>
      </main>
    </div>
  )
}
