import React from 'react'

const CITIES = ['All', 'Kyrenia', 'Nicosia', 'Famagusta', 'Iskele', 'Morphou']
const AMENITIES = ['Pool', 'Beach', 'Spa', 'Casino', 'Restaurant', 'Gym', 'WiFi', 'Bar', 'Parking']

export default function FilterSidebar({ filters, onChange }) {
  const { city, amenities, minPrice, maxPrice, minRating } = filters

  const toggleAmenity = (a) => {
    const next = amenities.includes(a) ? amenities.filter(x => x !== a) : [...amenities, a]
    onChange({ ...filters, amenities: next })
  }

  return (
    <aside className="s-sidebar">
      <div className="s-heading">Filters</div>

      <div className="filter-title">City</div>
      {CITIES.map(c => (
        <label className="rating-item" key={c}>
          <input
            type="radio"
            name="city"
            checked={city === c}
            onChange={() => onChange({ ...filters, city: c })}
          />
          {c}
        </label>
      ))}

      <div className="filter-title">Amenities</div>
      {AMENITIES.map(a => (
        <label className="filter-item" key={a}>
          <input
            type="checkbox"
            checked={amenities.includes(a)}
            onChange={() => toggleAmenity(a)}
          />
          {a}
        </label>
      ))}

      <div className="filter-title">Price Range (per night)</div>
      <div className="price-row">
        <input
          className="price-inp"
          type="number"
          placeholder="Min $"
          value={minPrice}
          onChange={e => onChange({ ...filters, minPrice: e.target.value })}
        />
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>–</span>
        <input
          className="price-inp"
          type="number"
          placeholder="Max $"
          value={maxPrice}
          onChange={e => onChange({ ...filters, maxPrice: e.target.value })}
        />
      </div>

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
        onClick={() => onChange({ city: 'All', amenities: [], minPrice: '', maxPrice: '', minRating: 0 })}
      >
        Clear Filters
      </button>
    </aside>
  )
}
