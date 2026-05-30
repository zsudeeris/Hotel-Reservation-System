import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, Users, Shield, Star, MapPin } from 'lucide-react'
import LandingNavbar from '../components/LandingNavbar.jsx'
import LandingHotelCard from '../components/LandingHotelCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Footer from '../components/Footer.jsx'
import ChatBot from '../components/ChatBot.jsx'
import { getHotels } from '../services/api.js'
import { DEMO_HOTELS } from '../data/demoHotels.js'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80'

const QUICK_FILTERS = [
  { label: '🏖 Beachfront', q: 'Beach' },
  { label: '🎰 Casino Resort', q: 'Casino' },
  { label: '💆 Spa & Wellness', q: 'Spa' },
  { label: '👨‍👩‍👧 Family Friendly', q: 'Family' },
  { label: '🏔 Mountain View', q: 'Mountain' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState([])

  useEffect(() => {
    getHotels()
      .then(data => {
        const list = Array.isArray(data) ? data : (data.hotels || [])
        setHotels(list.length > 0 ? list.slice(0, 6) : DEMO_HOTELS.slice(0, 6))
      })
      .catch(() => setHotels(DEMO_HOTELS.slice(0, 6)))
  }, [])

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <section className="lhero">
        <img className="lhero-img" src={HERO_IMAGE} alt="Luxury Hotel" />
        <div className="lhero-overlay" />
        <LandingNavbar />
        <div className="lhero-content">
          <div className="lhero-badge">
            <Star style={{ width: 12, height: 12, fill: 'rgba(255,255,255,0.9)', stroke: 'none' }} />
            Trusted by 10,000+ travelers
          </div>
          <h1 className="lhero-title">Where Every Stay<br />Becomes a Memory</h1>
          <p className="lhero-sub">
            Discover luxury hotels in Northern Cyprus. Book your perfect getaway with exclusive deals and world-class service.
          </p>
          <SearchBar variant="landing" />
          <div className="lhero-filters">
            {QUICK_FILTERS.map(f => (
              <button
                key={f.q}
                className="lfilter-chip"
                onClick={() => navigate(`/search?q=${f.q}`)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="lstats">
        <div className="lstat">
          <span className="lstat-num">50+</span>
          <span className="lstat-lbl">Hotels</span>
        </div>
        <div className="lstat-div" />
        <div className="lstat">
          <span className="lstat-num">5</span>
          <span className="lstat-lbl">Destinations</span>
        </div>
        <div className="lstat-div" />
        <div className="lstat">
          <span className="lstat-num">10K+</span>
          <span className="lstat-lbl">Happy Guests</span>
        </div>
        <div className="lstat-div" />
        <div className="lstat">
          <span className="lstat-num">24/7</span>
          <span className="lstat-lbl">Support</span>
        </div>
      </div>

      {/* Featured Hotels */}
      <section className="lsection">
        <div className="lsection-head">
          <div>
            <div className="lsection-badge">Featured Properties</div>
            <h2 className="lsection-title">Top Hotels in Northern Cyprus</h2>
          </div>
          <button className="lview-all" onClick={() => navigate('/search')}>
            View All Hotels
          </button>
        </div>
        <div className="lhotels-grid">
          {hotels.map(hotel => (
            <LandingHotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="lwhy" id="why-us">
        <div className="lwhy-head">
          <div className="lsection-badge">How It Works</div>
          <h2 className="lsection-title">Book Your Stay in 3 Simple Steps</h2>
          <p className="lwhy-sub">Our streamlined booking process makes it easy to find and reserve your ideal hotel in Northern Cyprus.</p>
        </div>
        <div className="lwhy-grid">
          <div className="lwhy-card">
            <div className="lwhy-icon">
              <Search />
            </div>
            <div className="lwhy-num">Step 01</div>
            <div className="lwhy-name">Search Hotels</div>
            <p className="lwhy-desc">Enter your destination, dates, and number of guests to browse available hotels.</p>
          </div>
          <div className="lwhy-connector" />
          <div className="lwhy-card">
            <div className="lwhy-icon">
              <Calendar />
            </div>
            <div className="lwhy-num">Step 02</div>
            <div className="lwhy-name">Choose & Book</div>
            <p className="lwhy-desc">Select your preferred room, add extras, and fill in your guest information.</p>
          </div>
          <div className="lwhy-connector" />
          <div className="lwhy-card">
            <div className="lwhy-icon">
              <Shield />
            </div>
            <div className="lwhy-num">Step 03</div>
            <div className="lwhy-name">Pay Securely</div>
            <p className="lwhy-desc">Complete your booking with our secure payment system and receive instant confirmation.</p>
          </div>
        </div>
      </section>

      <Footer />
      <ChatBot />
    </div>
  )
}
