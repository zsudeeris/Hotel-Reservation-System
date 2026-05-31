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
import {
  getHotelPriceValue,
  hotelMatchesAmenitiesFilter,
  hotelMatchesCityFilter,
  parseNumericValue,
} from '../utils/searchFilters.js'

export default function SearchResultsPage() {
  const [params] = useSearchParams()
  const { user } = useAuth()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState(params.get('sort') || 'recommended')
  const [filters, setFilters] = useState({
    city: 'all', amenities: [], minPrice: '', maxPrice: '', minRating: 0
  })

  const q = params.get('q') || ''
  const checkin = params.get('checkin') || ''
  const checkout = params.get('checkout') || ''
  const adults = params.get('adults') || '2'
  const rooms = params.get('rooms') || '1'
  const guestTouched = params.get('guestTouched') || '0'

  useEffect(() => {
    try {
      sessionStorage.setItem('bookhotel:lastSearch', JSON.stringify({
        q,
        checkin,
        checkout,
        adults,
        rooms,
        guestTouched,
      }))
    } catch {}
  }, [q, checkin, checkout, adults, rooms, guestTouched])

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

  const minPriceValue = parseNumericValue(filters.minPrice)
  const maxPriceValue = parseNumericValue(filters.maxPrice)
  const hasPriceError =
    Number.isFinite(minPriceValue) &&
    Number.isFinite(maxPriceValue) &&
    minPriceValue > maxPriceValue

  const filtered = hasPriceError
    ? []
    : hotels.filter(h => {
    if (!hotelMatchesCityFilter(h, filters.city)) return false
    if (filters.minRating && parseFloat(h.score || 0) < filters.minRating) return false
    const hotelPrice = getHotelPriceValue(h)
    if (Number.isFinite(minPriceValue) && (!Number.isFinite(hotelPrice) || hotelPrice < minPriceValue)) return false
    if (Number.isFinite(maxPriceValue) && (!Number.isFinite(hotelPrice) || hotelPrice > maxPriceValue)) return false
    if (!hotelMatchesAmenitiesFilter(h, filters.amenities)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price_asc': return (getHotelPriceValue(a) || 0) - (getHotelPriceValue(b) || 0)
      case 'price_desc': return (getHotelPriceValue(b) || 0) - (getHotelPriceValue(a) || 0)
      case 'score_desc': return (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0)
      case 'name_asc': return (a.hotel_name || a.name || '').localeCompare(b.hotel_name || b.name || '')
      default: return 0
    }
  })

  return (
    <div>
      {user ? (
        <Navbar />
      ) : (
        <header className="search-topbar">
          <LandingNavbar />
        </header>
      )}
      <div className="search-page-layout">
        <FilterSidebar filters={filters} onChange={setFilters} priceError={hasPriceError ? 'Min price cannot be greater than max price.' : ''} />
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
              <h3>No hotels found matching these filters.</h3>
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
