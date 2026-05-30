import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, ChevronLeft, ChevronRight, Heart, Check } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import LandingNavbar from '../components/LandingNavbar.jsx'
import RoomCard from '../components/RoomCard.jsx'
import ChatBot from '../components/ChatBot.jsx'
import { getHotel } from '../services/api.js'
import { DEMO_HOTELS } from '../data/demoHotels.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useBooking } from '../context/BookingContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
]

export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setHotel, setRoom, setDates, dateState } = useBooking()
  const { toggle, isFavorite } = useWishlist()

  const [hotel, setHotelData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [descExpanded, setDescExpanded] = useState(false)
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() } })
  const [checkin, setCheckin] = useState(dateState?.checkin || null)
  const [checkout, setCheckout] = useState(dateState?.checkout || null)
  const [picking, setPicking] = useState('checkin')

  useEffect(() => {
    setLoading(true)
    getHotel(id)
      .then(data => {
        if (data && data.id) setHotelData(data)
        else setHotelData(DEMO_HOTELS.find(h => h.id === parseInt(id)) || DEMO_HOTELS[0])
      })
      .catch(() => setHotelData(DEMO_HOTELS.find(h => h.id === parseInt(id)) || DEMO_HOTELS[0]))
      .finally(() => setLoading(false))
  }, [id])

  const handleBookRoom = (room) => {
    if (!user) { navigate('/login'); return }
    setHotel(hotel)
    setRoom(room)
    setDates({ checkin, checkout })
    navigate('/booking')
  }

  const nights = (checkin && checkout) ? Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24))) : 1

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const handleDayClick = (dateStr) => {
    const d = new Date(dateStr)
    if (d < today) return
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

  const images = hotel.img ? [hotel.img, ...GALLERY_IMAGES.slice(1)] : GALLERY_IMAGES

  return (
    <div style={{ background: 'var(--bg)' }}>
      {user ? <Navbar /> : <div style={{ position: 'relative', height: 72, background: '#1a6b5a' }}><LandingNavbar /></div>}

      {/* Detail bar */}
      <div className="detail-bar">
        <div className="detail-bar-inner">
          <div className="db-field">
            <label>Destination</label>
            <span>{hotel.city}</span>
          </div>
          <div className="db-field">
            <label>Check-in</label>
            <span>{checkin || 'Select date'}</span>
          </div>
          <div className="db-field">
            <label>Check-out</label>
            <span>{checkout || 'Select date'}</span>
          </div>
          <div className="db-field">
            <label>Stay</label>
            <span>{nights} night{nights !== 1 ? 's' : ''}</span>
          </div>
          <button className="db-search" onClick={() => setActiveTab('rooms')}>
            <Star style={{ width: 19, height: 19 }} />
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <h1 className="detail-hotel-name">{hotel.hotel_name}</h1>
            <div className="detail-hotel-loc">
              <MapPin style={{ width: 14, height: 14 }} />
              {hotel.city}, Northern Cyprus
              <span style={{ marginLeft: 8 }}>{'★'.repeat(hotel.stars || 5)}</span>
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
            <img src={images[0]} alt={hotel.hotel_name} onError={e => { e.target.src = GALLERY_IMAGES[0] }} />
          </div>
          <div className="gal-side">
            <img src={images[1]} alt={hotel.hotel_name} onError={e => { e.target.src = GALLERY_IMAGES[1] }} />
            <div className="gal-more">
              <img src={images[2]} alt={hotel.hotel_name} onError={e => { e.target.src = GALLERY_IMAGES[2] }} />
              <div className="gal-more-overlay">+ More Photos</div>
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
            <button className="btn-view-rooms" onClick={() => setActiveTab('rooms')}>View Rooms</button>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            {/* Description */}
            <p className={`detail-desc ${descExpanded ? '' : 'collapsed'}`}>
              {hotel.description || `${hotel.hotel_name} is a magnificent hotel in ${hotel.city}, Northern Cyprus. Offering world-class amenities and exceptional service, this property provides an unforgettable stay experience with stunning views and luxurious accommodations.`}
            </p>
            <button className="see-more-btn" onClick={() => setDescExpanded(e => !e)}>
              {descExpanded ? 'Show less ↑' : 'Read more ↓'}
            </button>

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
                    <div className="detail-score-badge">{hotel.score}</div>
                    <div>
                      <div className="detail-score-txt">{hotel.score >= 9 ? 'Exceptional' : 'Excellent'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{hotel.review_count || 0} reviews</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Rooms */}
            {activeTab === 'rooms' && (
              <>
                <h2 className="rooms-sec-title">Available Rooms</h2>
                {rooms.length > 0 ? (
                  rooms.map((room, i) => (
                    <RoomCard key={room.id || i} room={room} onBook={handleBookRoom} nights={nights} />
                  ))
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
              <button className="btn-view-rooms" style={{ width: '100%' }} onClick={() => setActiveTab('rooms')}>
                {checkin && checkout ? `View Rooms — ${nights} nights` : 'Select Dates'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChatBot />
    </div>
  )
}
