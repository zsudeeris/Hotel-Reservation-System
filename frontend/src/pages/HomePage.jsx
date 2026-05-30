import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import SearchBar from '../components/SearchBar.jsx'
import HotelCard from '../components/HotelCard.jsx'
import ChatBot from '../components/ChatBot.jsx'
import { getHotels } from '../services/api.js'
import { DEMO_HOTELS } from '../data/demoHotels.js'

const CATS = ['All', 'Beach', 'Casino', 'Spa', 'Mountain', 'Family', 'Luxury']
const PER_PAGE = 8

export default function HomePage() {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [activecat, setActiveCat] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    getHotels()
      .then(data => {
        const list = Array.isArray(data) ? data : (data.hotels || [])
        setHotels(list.length > 0 ? list : DEMO_HOTELS)
      })
      .catch(() => setHotels(DEMO_HOTELS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = activecat === 'All'
    ? hotels
    : hotels.filter(h => {
        const tags = [h.city, ...(Array.isArray(h.amenities) ? h.amenities : (h.amenities || '').split(','))].map(a => a.toLowerCase())
        return tags.some(t => t.includes(activecat.toLowerCase()))
      })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="home-wrap">
      <Navbar />

      {/* Hero */}
      <div className="home-hero">
        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80" alt="Northern Cyprus" />
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <Sparkles style={{ width: 12, height: 12 }} />
            Discover Northern Cyprus
          </div>
          <h1 className="home-hero-title">Find Your Perfect Stay</h1>
          <p className="home-hero-sub">Luxury hotels, beachfront resorts, and more — all at your fingertips</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <SearchBar />
      </div>

      {/* Category chips */}
      <div className="home-cats">
        {CATS.map(cat => (
          <button
            key={cat}
            className={`cat-chip ${activecat === cat ? 'active' : ''}`}
            onClick={() => { setActiveCat(cat); setPage(1) }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hotel Grid */}
      <div className="sec-head">
        <h2 className="sec-title">
          {activecat === 'All' ? 'All Hotels' : `${activecat} Hotels`}
        </h2>
        <p className="sec-sub">{filtered.length} properties found</p>
      </div>

      {loading ? (
        <div className="page-loading">Loading hotels...</div>
      ) : (
        <div className="hotels-grid">
          {paginated.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pg-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="pg-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      <ChatBot />
    </div>
  )
}
