import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import LandingNavbar from '../components/LandingNavbar.jsx'
import FilterSidebar from '../components/FilterSidebar.jsx'
import SearchHotelCard from '../components/SearchHotelCard.jsx'
import SortDropdown from '../components/SortDropdown.jsx'
import ChatBot from '../components/ChatBot.jsx'
import { searchHotels, getHotels } from '../services/api.js'
import { DEMO_HOTELS } from '../data/demoHotels.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function SearchResultsPage() {
  const [params] = useSearchParams()
  const { user } = useAuth()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState(params.get('sort') || 'recommended')
  const [filters, setFilters] = useState({
    city: 'All', amenities: [], minPrice: '', maxPrice: '', minRating: 0
  })

  const q = params.get('q') || ''
  const checkin = params.get('checkin') || ''
  const checkout = params.get('checkout') || ''
  const adults = params.get('adults') || '2'
  const rooms = params.get('rooms') || '1'

  useEffect(() => {
    setLoading(true)
    const fetchData = q
      ? searchHotels({ q, checkin, checkout, adults, rooms })
      : getHotels()

    fetchData
      .then(data => {
        const list = Array.isArray(data) ? data : (data.hotels || data.results || [])
        setHotels(list.length > 0 ? list : DEMO_HOTELS)
      })
      .catch(() => setHotels(DEMO_HOTELS))
      .finally(() => setLoading(false))
  }, [q, checkin, checkout, adults, rooms])

  const filtered = hotels.filter(h => {
    if (filters.city !== 'All' && h.city !== filters.city) return false
    if (filters.minRating && parseFloat(h.score || 0) < filters.minRating) return false
    if (filters.minPrice && (h.price_per_night || h.min_price || 0) < parseFloat(filters.minPrice)) return false
    if (filters.maxPrice && (h.price_per_night || h.min_price || 0) > parseFloat(filters.maxPrice)) return false
    if (filters.amenities.length > 0) {
      const ha = Array.isArray(h.amenities) ? h.amenities : (h.amenities || '').split(',').map(a => a.trim())
      if (!filters.amenities.every(a => ha.some(x => x.toLowerCase().includes(a.toLowerCase())))) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price_asc': return (a.price_per_night || 0) - (b.price_per_night || 0)
      case 'price_desc': return (b.price_per_night || 0) - (a.price_per_night || 0)
      case 'score_desc': return (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0)
      case 'name_asc': return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  return (
    <div>
      {user ? <Navbar /> : <div style={{ position: 'relative' }}><LandingNavbar /></div>}
      <div className="search-page-layout" style={{ marginTop: user ? 0 : 0 }}>
        <FilterSidebar filters={filters} onChange={setFilters} />
        <main className="s-main">
          <div className="s-result-info">{loading ? 'Searching...' : `${sorted.length} properties found`}</div>
          <h1 className="s-result-title">
            {q ? `Results for "${q}"` : 'Cyprus Hotels'}
          </h1>
          <div className="sort-row">
            <span style={{ fontSize: 13, color: 'var(--sub)' }}>{sorted.length} hotels</span>
            <SortDropdown value={sort} onChange={setSort} />
          </div>
          {loading ? (
            <div className="page-loading">Searching hotels...</div>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--sub)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏨</div>
              <h3>No hotels found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            sorted.map(hotel => <SearchHotelCard key={hotel.id} hotel={hotel} />)
          )}
        </main>
      </div>
      <ChatBot />
    </div>
  )
}
