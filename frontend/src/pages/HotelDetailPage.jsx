import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { MapPin, ChevronLeft, ChevronRight, Heart, Check } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import LandingNavbar from '../components/LandingNavbar.jsx'
import SearchBar from '../components/SearchBar.jsx'
import AvailableRooms from '../components/AvailableRooms.jsx'
import ChatBot from '../components/ChatBot.jsx'
import { getHotel, getHotelReviews } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useBooking } from '../context/BookingContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { DEMO_HOTELS } from '../data/demoHotels.js'
import {
  buildRoomPlansFromTotals,
  computeBookingTotals,
  getNights,
  roomPlanTotals,
  normalizeRoomSelections,
  roomSelectionTotals,
} from '../utils/bookingState.js'

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
]

function getHotelName(hotel) {
  return hotel?.hotel_name || hotel?.name || 'Hotel name unavailable'
}

function getHotelLocation(hotel) {
  const parts = [hotel?.city, hotel?.district].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Location unavailable'
}

function buildGalleryImages(hotel) {
  const pool = [
    hotel?.img,
    hotel?.image_url,
    ...GALLERY_IMAGES,
  ].filter(Boolean)

  while (pool.length < 4) {
    pool.push(pool[pool.length % GALLERY_IMAGES.length] || GALLERY_IMAGES[0])
  }

  return pool.slice(0, 4)
}

function buildGuestHighlights(hotel, amenities, averageRating, reviewCount) {
  const highlights = new Set()
  const amenityText = amenities.join(' ').toLowerCase()
  const hotelText = `${hotel?.hotel_name || ''} ${hotel?.description || ''} ${amenityText}`.toLowerCase()

  if (hotelText.includes('beach')) highlights.add('Great location')
  if (amenityText.includes('spa')) highlights.add('Relaxing spa area')
  if (amenityText.includes('casino')) highlights.add('Popular entertainment options')
  if (amenityText.includes('pool')) highlights.add('Relaxing pool area')
  if (amenityText.includes('kids') || amenityText.includes('family')) highlights.add('Popular with families')
  if (amenityText.includes('restaurant') || amenityText.includes('breakfast')) highlights.add('Highly rated breakfast')
  if (averageRating && averageRating >= 8.5) highlights.add('Friendly staff')
  if (averageRating && averageRating >= 9) highlights.add('Clean and spacious rooms')
  if (reviewCount >= 100) highlights.add('Recommended by guests')
  if (hotel?.city || hotel?.district) highlights.add('Good value for money')

  return Array.from(highlights).slice(0, 8)
}

function buildGoodToKnow() {
  return [
    'Check-in starts at 14:00',
    'Check-out until 12:00',
    'Free cancellation may be available depending on room type',
    'Breakfast options are available',
    'Special requests are subject to availability',
  ]
}

function getHotelDescription(hotel) {
  const raw = (hotel?.description || '').trim()
  if (raw) return raw

  const name = getHotelName(hotel)
  const city = hotel?.city || 'Northern Cyprus'
  const district = hotel?.district || city
  const amenities = Array.isArray(hotel?.amenities)
    ? hotel.amenities
    : (hotel?.amenities || '').split(',').map(a => a.trim()).filter(Boolean)
  const amenityText = amenities.join(', ')
  const amenityHints = []
  if (amenities.some(a => /casino/i.test(a))) amenityHints.push('casino entertainment')
  if (amenities.some(a => /spa/i.test(a))) amenityHints.push('a relaxing spa')
  if (amenities.some(a => /beach/i.test(a))) amenityHints.push('easy access to the beach')
  if (amenities.some(a => /kids|family/i.test(a))) amenityHints.push('family-friendly facilities')
  if (amenities.some(a => /restaurant|breakfast/i.test(a))) amenityHints.push('popular dining options')
  if (amenities.some(a => /pool/i.test(a))) amenityHints.push('a refreshing pool area')

  const typeLine = amenityHints.length
    ? `Guests can enjoy ${amenityHints.slice(0, 3).join(', ')}.`
    : 'Guests can enjoy a comfortable stay with thoughtful services and facilities.'

  return `${name} is a standout hotel in ${district}, ${city}. ${typeLine} The property is designed for travelers who value comfort, convenience, and a polished hotel experience. ${
    amenityText ? `Key amenities include ${amenityText}.` : ''
  }`
}

function readStoredSearchState() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem('bookhotel:lastSearch')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { selectedRoom, setHotel, setRoom, setDates, dateState, guestState, roomPlans, roomSelections, setGuests, setRoomPlans, setRoomSelections } = useBooking()
  const { toggle, isFavorite } = useWishlist()

  const [hotel, setHotelData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [descExpanded, setDescExpanded] = useState(false)
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() } })
  const [checkin, setCheckin] = useState(dateState?.checkin || null)
  const [checkout, setCheckout] = useState(dateState?.checkout || null)
  const [picking, setPicking] = useState('checkin')
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ average_rating: null, review_count: 0, recommend_count: 0 })
  const [reviewsExpanded, setReviewsExpanded] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const searchInitialValues = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const stored = readStoredSearchState()
    return {
      q: params.get('q') || stored.q || '',
      checkin: params.get('checkin') || stored.checkin || '',
      checkout: params.get('checkout') || stored.checkout || '',
      adults: params.get('adults') || stored.adults || '',
      children: params.get('children') || stored.children || '',
      rooms: params.get('rooms') || stored.rooms || '',
      guestTouched: params.get('guestTouched') || stored.guestTouched || '',
    }
  }, [location.search])

  useEffect(() => {
    setLoading(true)
    const demoFallback = DEMO_HOTELS.find(item => String(item.id) === String(id)) || null
    if (demoFallback) setHotelData(demoFallback)
    getHotel(id)
      .then(data => {
        if (data && data.id) setHotelData(data)
        else setHotelData(demoFallback)
      })
      .catch(() => setHotelData(demoFallback))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    setDescExpanded(false)
  }, [hotel?.id])

  useEffect(() => {
    if (!roomPlans || !roomPlans.length) {
      setRoomPlans(buildRoomPlansFromTotals(guestState?.rooms || 1, guestState?.adults || 2, guestState?.children || 0))
    }
  }, [hotel?.id])

  useEffect(() => {
    if (!hotel?.id) return
    let alive = true
    getHotelReviews(hotel.id)
      .then(data => {
        if (!alive) return
        const list = Array.isArray(data?.reviews) ? data.reviews : []
        setReviews(list)
        setReviewStats(data?.stats || { average_rating: null, review_count: list.length, recommend_count: 0 })
      })
      .catch(() => {
        if (!alive) return
        const fallback = Array.isArray(hotel?.guest_reviews) ? hotel.guest_reviews : []
        setReviews(fallback)
        setReviewStats({
          average_rating: fallback.length ? fallback.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0) / fallback.length : null,
          review_count: fallback.length,
          recommend_count: Math.round(fallback.length * 0.7),
        })
    })
    return () => { alive = false }
  }, [hotel?.id])

  useEffect(() => {
    const totals = roomPlanTotals(roomPlans && roomPlans.length ? roomPlans : buildRoomPlansFromTotals(guestState?.rooms || 1, guestState?.adults || 2, guestState?.children || 0))
    setGuests({
      adults: totals.totalAdults,
      children: totals.totalChildren,
      rooms: totals.roomCount,
    })
  }, [roomPlans, guestState?.adults, guestState?.children, guestState?.rooms, setGuests])

  const hasValidDates = checkin && checkout && checkout > checkin

  const handleBookRoom = (room) => {
    if (!hasValidDates) {
      setBookingError('Please select check-in and check-out dates before booking.')
      return
    }
    setBookingError('')
    if (!user) { navigate('/login'); return }
    setHotel(hotel)
    setRoom(room)
    setDates({ checkin, checkout })
    navigate('/booking')
  }

  const nights = getNights(checkin, checkout) || 1

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const handleDayClick = (dateStr) => {
    const d = new Date(dateStr)
    if (d < today) return
    setBookingError('')
    if (picking === 'checkin') {
      setCheckin(dateStr)
      setCheckout(null)
      setPicking('checkout')
    } else {
      if (checkin && d <= new Date(checkin)) {
        setCheckin(dateStr)
        setCheckout(null)
        setPicking('checkout')
      } else {
        setCheckout(dateStr)
        setPicking('checkin')
      }
    }
  }

  const amenities = hotel ? (Array.isArray(hotel.amenities) ? hotel.amenities : (hotel.amenities || '').split(',').map(a => a.trim()).filter(Boolean)) : []
  const rooms = hotel?.rooms || []
  const fav = hotel ? isFavorite(hotel.id) : false
  const hotelName = getHotelName(hotel)
  const hotelLocation = getHotelLocation(hotel)
  const galleryImages = buildGalleryImages(hotel)
  const shownReviews = reviewsExpanded ? reviews : reviews.slice(0, 2)
  const averageRating = reviewStats.average_rating !== null && reviewStats.average_rating !== undefined
    ? parseFloat(reviewStats.average_rating)
    : (reviews.length ? (reviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0) / reviews.length) : null)
  const reviewCount = Number(reviewStats.review_count || reviews.length || 0)
  const recommendCount = Number(reviewStats.recommend_count || Math.round(reviewCount * 0.7))
  const reviewRecommendLabel = reviewCount > 0 ? `${Math.round((recommendCount / reviewCount) * 100)}% Recommends` : 'No reviews yet'
  const displayScore = averageRating ?? parseFloat(hotel?.score || 0)
  const guestHighlights = buildGuestHighlights(hotel, amenities, averageRating, reviewCount)
  const goodToKnow = buildGoodToKnow()
  const descriptionText = getHotelDescription(hotel)
  const isLongDescription = descriptionText.length > 220
  const bookingRoomPlans = roomPlans && roomPlans.length
    ? roomPlans
    : buildRoomPlansFromTotals(guestState?.rooms || 1, guestState?.adults || 2, guestState?.children || 0)
  const bookingTotals = roomPlanTotals(bookingRoomPlans)
  const nightsForPricing = getNights(checkin, checkout) || 1
  const resolvedRoomSelections = normalizeRoomSelections(roomSelections, bookingRoomPlans, rooms)
  const canContinueToBooking = resolvedRoomSelections.length > 0 && resolvedRoomSelections.every(selection => selection?.room)
  const selectedRoomForPrice = resolvedRoomSelections[0]?.room || selectedRoom || rooms[0] || null
  const selectionTotals = roomSelectionTotals(resolvedRoomSelections, nightsForPricing)
  const pricePreview = selectionTotals.roomCount > 0
    ? selectionTotals
    : computeBookingTotals(selectedRoomForPrice?.price_per_night || selectedRoomForPrice?.price || hotel?.price_from || 0, nightsForPricing, bookingTotals.roomCount)

  useEffect(() => {
    if (!rooms.length || !bookingRoomPlans.length) return
    setRoomSelections(prev => normalizeRoomSelections(prev, bookingRoomPlans, rooms))
  }, [rooms, bookingRoomPlans, setRoomSelections])

  const handlePrimaryAction = () => {
    if (!hasValidDates) {
      setBookingError('Please select check-in and check-out dates before booking.')
      return
    }
    setBookingError('')
    if (activeTab === 'rooms') {
      if (!canContinueToBooking) {
        setBookingError('Please select a room type for each room before continuing.')
        return
      }
      navigate('/booking')
      return
    }
    setActiveTab('rooms')
  }

  if (loading) return (
    <div>
      {user ? <Navbar /> : <div style={{ position: 'relative', height: 72, background: '#1a6b5a' }}><LandingNavbar /></div>}
      <div className="page-loading">Loading hotel...</div>
    </div>
  )

  if (!hotel) return (
    <div>
      {user ? <Navbar /> : <div style={{ position: 'relative', height: 72, background: '#1a6b5a' }}><LandingNavbar /></div>}
      <div className="page-loading">Hotel not found</div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)' }}>
      {user ? <Navbar /> : <div style={{ position: 'relative', height: 72, background: '#1a6b5a' }}><LandingNavbar /></div>}

      <SearchBar variant="detail" initialValues={searchInitialValues} />

      <div className="detail-content">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <h1 className="detail-hotel-name">{hotelName}</h1>
            <div className="detail-hotel-loc">
              <MapPin style={{ width: 14, height: 14 }} />
              <span>{hotelLocation}</span>
              <span style={{ marginLeft: 8 }}>{'★'.repeat(hotel.stars || 5)}</span>
              {displayScore && (
                <span className="detail-score-inline">
                  {parseFloat(displayScore).toFixed(1)} · {displayScore >= 9 ? 'Exceptional' : displayScore >= 8 ? 'Excellent' : 'Very Good'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => toggle(hotel)}
            style={{ background: fav ? 'var(--red-light)' : 'var(--white)', border: `1.5px solid ${fav ? 'var(--red)' : 'var(--border)'}`, borderRadius: 10, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: fav ? 'var(--red)' : 'var(--sub)' }}
          >
            <Heart style={{ width: 16, height: 16, fill: fav ? 'var(--red)' : 'none', stroke: fav ? 'var(--red)' : 'currentColor' }} />
            {fav ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Gallery */}
        <div className="detail-gallery">
          <div className="gal-main">
            <img src={galleryImages[0]} alt={hotelName} onError={e => { e.target.src = GALLERY_IMAGES[0] }} />
          </div>
          <div className="gal-side">
            <div className="gal-side-item">
              <img src={galleryImages[1]} alt={hotelName} onError={e => { e.target.src = GALLERY_IMAGES[1] }} />
            </div>
            <div className="gal-side-item">
              <img src={galleryImages[2]} alt={hotelName} onError={e => { e.target.src = GALLERY_IMAGES[2] }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <div className="detail-tabs-left">
            {['overview', 'rooms', 'facilities'].map(tab => (
              <button key={tab} className={`d-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="detail-price-action">
            {rooms.length > 0 && (
              <span className="detail-price-label">From ${Math.min(...rooms.map(r => r.price_per_night || r.price || 99))}/night</span>
            )}
            <button className="btn-view-rooms" onClick={handlePrimaryAction}>{activeTab === 'rooms' ? 'Continue' : 'View Rooms'}</button>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            {/* Description */}
            <p className={`detail-desc ${isLongDescription && !descExpanded ? 'collapsed' : ''}`}>
              {descriptionText}
            </p>
            {isLongDescription && (
              <button className="see-more-btn" onClick={() => setDescExpanded(e => !e)}>
                {descExpanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            )}

            {/* Amenities */}
            {activeTab !== 'rooms' && (
              <>
                <div className="amenity-tags">
                  {amenities.slice(0, 8).map((a, i) => (
                    <span key={i} className="amenity-tag">{a}</span>
                  ))}
                </div>

                {/* Rating */}
                {hotel.score && (
                  <div className="detail-rating-row">
                    <div className="detail-score-badge">{displayScore.toFixed ? displayScore.toFixed(1) : displayScore}</div>
                    <div>
                      <div className="detail-score-txt">{displayScore >= 9 ? 'Exceptional' : displayScore >= 8 ? 'Excellent' : 'Very Good'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{reviewCount} reviews</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Reviews */}
            <div className="detail-reviews-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 4 }}>Recent Reviews</div>
                  <h2 className="rooms-sec-title" style={{ margin: 0 }}>Guest Reviews</h2>
                </div>
                <div className="detail-rating-row" style={{ margin: 0, minWidth: 240 }}>
                  <div className="detail-score-badge">{averageRating ? averageRating.toFixed(1) : '—'}</div>
                  <div>
                    <div className="detail-score-txt">{reviewCount ? (averageRating >= 9 ? 'Exceptional' : averageRating >= 8 ? 'Excellent' : 'Very Good') : 'No reviews yet'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{reviewCount} reviews · {reviewRecommendLabel}</div>
                  </div>
                </div>
              </div>

              {reviewCount > 0 ? (
                shownReviews.map((review, index) => (
                  <div key={`${review.reviewer_name || 'review'}-${index}`} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
                      <strong style={{ fontSize: 13 }}>{review.reviewer_name || 'Guest'}</strong>
                      <span style={{ background: 'var(--green)', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{parseFloat(review.rating || 0).toFixed(1)}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.55 }}>{review.comment || ''}</div>
                  </div>
                ))
              ) : (
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, color: 'var(--muted)', fontSize: 13, border: '1px solid var(--border)' }}>
                  No reviews yet. Be the first to review this hotel.
                </div>
              )}

              {reviewCount > 2 && (
                <button
                  className="detail-comments-link"
                  type="button"
                  onClick={() => setReviewsExpanded(v => !v)}
                  style={{ marginTop: 10 }}
                >
                  {reviewsExpanded ? 'Hide Reviews' : 'See All Reviews'}
                </button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 14 }}>
                <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Guest Highlights</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {guestHighlights.length > 0 ? guestHighlights.map((item) => (
                      <span
                        key={item}
                        style={{
                          background: 'var(--green-light)',
                          color: 'var(--green-dark)',
                          border: '1px solid rgba(26,107,90,.14)',
                          borderRadius: 999,
                          padding: '8px 12px',
                          fontSize: 12.5,
                          fontWeight: 700,
                        }}
                      >
                        {item}
                      </span>
                    )) : (
                      <span style={{ color: 'var(--muted)', fontSize: 13 }}>Good location and guest-friendly service.</span>
                    )}
                  </div>
                </div>

                <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Good to Know</div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {goodToKnow.map((item) => (
                      <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
                        <Check style={{ width: 15, height: 15, color: 'var(--green)', marginTop: 2, flexShrink: 0 }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms */}
            {activeTab === 'rooms' && (
              <>
                <h2 className="rooms-sec-title">Available Rooms</h2>
                {rooms.length > 0 ? (
                  <div style={{ display: 'grid', gap: 18 }}>
                    <AvailableRooms
                      rooms={rooms}
                      roomPlans={bookingRoomPlans}
                      roomSelections={resolvedRoomSelections}
                      nights={nights}
                      onSelectRoom={(roomIndex, room) => {
                        setRoomSelections(prev => {
                          const next = normalizeRoomSelections(prev, bookingRoomPlans, rooms)
                          next[roomIndex] = {
                            ...next[roomIndex],
                            roomId: room.id,
                            room: {
                              ...room,
                              capacity: room.capacity || room.max_guests || 0,
                              price_per_night: room.price_per_night || room.price || 0,
                            },
                            roomType: room.room_type || room.name || null,
                            capacity: room.capacity || room.max_guests || 0,
                            pricePerNight: room.price_per_night || room.price || 0,
                          }
                          setRoom(next.map(selection => selection?.room).find(Boolean) || null)
                          return next
                        })
                      }}
                    />
                    <div className="available-rooms-continue">
                      <div>
                        <div className="available-rooms-continue-title">Ready to continue</div>
                        <div className="available-rooms-continue-sub">
                          {resolvedRoomSelections.filter(sel => sel?.room).length} of {bookingRoomPlans.length} room{bookingRoomPlans.length !== 1 ? 's' : ''} selected
                        </div>
                      </div>
                      <button
                        className="btn-view-rooms"
                        type="button"
                        onClick={handlePrimaryAction}
                        disabled={!canContinueToBooking}
                      >
                        Continue to Booking
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--sub)' }}>
                    <p style={{ marginBottom: 16 }}>No rooms available for selected dates.</p>
                    <button className="btn-view-rooms" onClick={() => handleBookRoom({ room_type: 'Standard Room', price_per_night: hotel.price_per_night || 150, capacity: 2 })}>
                      Book Standard Room
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Facilities */}
            {activeTab === 'facilities' && (
              <div>
                <h2 className="rooms-sec-title">All Facilities</h2>
                <div className="amenity-tags">
                  {amenities.map((a, i) => (
                    <span key={i} className="amenity-tag">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking side */}
          <div className="booking-side">
            <div className="booking-side-title">
              <Check style={{ width: 14, height: 14, stroke: 'var(--green)' }} />
              Select Your Dates
            </div>
            <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
              {picking === 'checkin' ? 'Selecting check-in date' : 'Selecting check-out date'}
            </div>
            {bookingError && <div className="ferr show" style={{ display: 'block', marginBottom: 10 }}>{bookingError}</div>}

            {/* Calendar */}
            <div className="cal-nav-row">
              <button className="cal-nav-btn" onClick={() => setCalMonth(m => { const d = new Date(m.year, m.month - 1); return { year: d.getFullYear(), month: d.getMonth() } })}>
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>
              <span className="cal-month-lbl">
                {new Date(calMonth.year, calMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button className="cal-nav-btn" onClick={() => setCalMonth(m => { const d = new Date(m.year, m.month + 1); return { year: d.getFullYear(), month: d.getMonth() } })}>
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div className="cal-grid">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="cal-dh">{d}</div>)}
              {Array.from({ length: getFirstDay(calMonth.year, calMonth.month) }).map((_, i) => <div key={`e${i}`} className="cal-d other" />)}
              {Array.from({ length: getDaysInMonth(calMonth.year, calMonth.month) }).map((_, i) => {
                const day = i + 1
                const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const d = new Date(calMonth.year, calMonth.month, day)
                const isPast = d < today
                const isCheckin = checkin === dateStr
                const isCheckout = checkout === dateStr
                const isInRange = checkin && checkout && d > new Date(checkin) && d < new Date(checkout)
                const isToday = d.toDateString() === today.toDateString()
                let cls = 'cal-d'
                if (isPast) cls += ' other'
                else if (isCheckin || isCheckout) cls += ' selected'
                else if (isInRange) cls += ' in-range'
                else if (isToday) cls += ' today'
                return (
                  <div key={day} className={cls} onClick={() => !isPast && handleDayClick(dateStr)}>
                    {day}
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 14, padding: '12px 0', borderTop: '1px solid var(--border)', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--sub)' }}>Check-in</span>
                <span style={{ fontWeight: 600 }}>{checkin || 'Not set'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ color: 'var(--sub)' }}>Check-out</span>
                <span style={{ fontWeight: 600 }}>{checkout || 'Not set'}</span>
              </div>
              <div className="detail-rooms-box">
                <div className="detail-rooms-head">
                  <div className="detail-rooms-copy">
                    <div className="detail-rooms-title">Rooms &amp; Guests</div>
                    <div className="detail-rooms-sub">
                      {bookingTotals.roomCount} room{bookingTotals.roomCount !== 1 ? 's' : ''}, {bookingTotals.totalGuests} guest{bookingTotals.totalGuests !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mini-action detail-rooms-add-btn"
                    onClick={() => setRoomPlans(prev => [...prev, { adults: 1, children: 0 }])}
                  >
                    Add another room
                  </button>
                </div>

                <div className="detail-rooms-list">
                  {bookingRoomPlans.map((room, index) => (
                    <div key={`room-plan-${index}`} className="detail-room-card">
                      <div className="detail-room-card-head">
                        <strong>Room {index + 1}</strong>
                        {bookingRoomPlans.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setRoomPlans(prev => prev.filter((_, i) => i !== index))}
                            className="detail-room-remove"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="detail-room-controls detail-room-controls--compact">
                        <div className="detail-room-control detail-room-control--stacked">
                          <span>Adults</span>
                          <div className="detail-room-stepper">
                            <button type="button" onClick={() => setRoomPlans(prev => prev.map((p, i) => i === index ? { ...p, adults: Math.max(1, p.adults - 1) } : p))}>−</button>
                            <strong>{room.adults}</strong>
                            <button type="button" onClick={() => setRoomPlans(prev => prev.map((p, i) => i === index ? { ...p, adults: p.adults + 1 } : p))}>+</button>
                          </div>
                        </div>

                        <div className="detail-room-control detail-room-control--stacked">
                          <span>Children</span>
                          <div className="detail-room-stepper">
                            <button type="button" onClick={() => setRoomPlans(prev => prev.map((p, i) => i === index ? { ...p, children: Math.max(0, p.children - 1) } : p))}>−</button>
                            <strong>{room.children}</strong>
                            <button type="button" onClick={() => setRoomPlans(prev => prev.map((p, i) => i === index ? { ...p, children: p.children + 1 } : p))}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="detail-rooms-total">
                  Estimated total: <strong>EUR {pricePreview.grandTotal.toFixed(0)}</strong>
                </div>
              </div>
              <button className="btn-view-rooms" style={{ width: '100%' }} onClick={handlePrimaryAction}>
                {checkin && checkout
                  ? (activeTab === 'rooms'
                    ? `Continue — ${nights} nights · ${bookingTotals.roomCount} room${bookingTotals.roomCount !== 1 ? 's' : ''}`
                    : `View Rooms — ${nights} nights · ${bookingTotals.roomCount} room${bookingTotals.roomCount !== 1 ? 's' : ''}`)
                  : 'Select Dates'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChatBot />
    </div>
  )
}
