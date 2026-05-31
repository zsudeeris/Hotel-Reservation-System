import React from 'react'
import { AMENITY_FILTERS, CITY_FILTERS, sanitizePriceInput } from '../utils/searchFilters.js'

export default function FilterSidebar({ filters, onChange, priceError = '' }) {
  const { city, amenities, minPrice, maxPrice, minRating } = filters

  const toggleAmenity = (a) => {
    const next = amenities.includes(a) ? amenities.filter(x => x !== a) : [...amenities, a]
    onChange({ ...filters, amenities: next })
  }

  return (
    <aside className="s-sidebar">
      <div className="s-heading">Filters</div>

      <div className="filter-title">City</div>
      {CITY_FILTERS.map(c => (
        <label className="rating-item" key={c.value}>
          <input
            type="radio"
            name="city"
            checked={city === c.value}
            onChange={() => onChange({ ...filters, city: c.value })}
          />
          {c.label}
        </label>
      ))}

      <div className="filter-title">Amenities</div>
      {AMENITY_FILTERS.map(a => (
        <label className="filter-item" key={a.value}>
          <input
            type="checkbox"
            checked={amenities.includes(a.value)}
            onChange={() => toggleAmenity(a.value)}
          />
          {a.label}
        </label>
      ))}

      <div className="filter-title">Price Range (per night)</div>
      <div className="price-row">
        <input
          className="price-inp"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="Min $"
          value={minPrice}
          onChange={e => onChange({ ...filters, minPrice: sanitizePriceInput(e.target.value) })}
        />
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>–</span>
        <input
          className="price-inp"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="Max $"
          value={maxPrice}
          onChange={e => onChange({ ...filters, maxPrice: sanitizePriceInput(e.target.value) })}
        />
      </div>
      {priceError && <div style={{ color: 'var(--red)', fontSize: 11.5, marginTop: 6, lineHeight: 1.4 }}>{priceError}</div>}

      <div className="filter-title">Min Rating</div>
      {[9, 8, 7, 0].map(r => (
        <label className="rating-item" key={r}>
          <input
            type="radio"
            name="rating"
            checked={minRating === r}
            onChange={() => onChange({ ...filters, minRating: r })}
          />
          {r === 0 ? 'Any' : r === 9 ? '9+ Exceptional' : r === 8 ? '8+ Excellent' : '7+ Very Good'}
        </label>
      ))}

      <button
        className="s-search-btn"
        onClick={() => onChange({ city: 'all', amenities: [], minPrice: '', maxPrice: '', minRating: 0 })}
      >
        Clear Filters
      </button>
    </aside>
  )
}
