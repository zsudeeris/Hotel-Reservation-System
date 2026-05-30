import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar } from 'lucide-react'
import GuestsSelector from './GuestsSelector.jsx'

export default function SearchBar({ initialValues = {}, variant = 'home' }) {
  const navigate = useNavigate()
  const [destination, setDestination] = useState(initialValues.q || '')
  const [checkin, setCheckin] = useState(initialValues.checkin || '')
  const [checkout, setCheckout] = useState(initialValues.checkout || '')
  const [guests, setGuests] = useState({
    adults: parseInt(initialValues.adults) || 2,
    children: parseInt(initialValues.children) || 0,
    rooms: parseInt(initialValues.rooms) || 1
  })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams({
      q: destination,
      checkin,
      checkout,
      adults: guests.adults,
      children: guests.children,
      rooms: guests.rooms
    })
    navigate('/search?' + params.toString())
  }

  if (variant === 'landing') {
    return (
      <form className="lsearch" onSubmit={handleSearch}>
        <div className="lsearch-field">
          <label><MapPin style={{ width: 11, height: 11, marginRight: 4 }} />Destination</label>
          <input
            type="text"
            placeholder="Where are you going?"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />
        </div>
        <div className="lsearch-divider" />
        <div className="lsearch-field">
          <label><Calendar style={{ width: 11, height: 11, marginRight: 4 }} />Check-in</label>
          <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)} style={{ colorScheme: 'light' }} />
        </div>
        <div className="lsearch-divider" />
        <div className="lsearch-field">
          <label><Calendar style={{ width: 11, height: 11, marginRight: 4 }} />Check-out</label>
          <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)} style={{ colorScheme: 'light' }} />
        </div>
        <div className="lsearch-divider" />
        <div className="lsearch-field">
          <label><Search style={{ width: 11, height: 11, marginRight: 4 }} />Guests</label>
          <GuestsSelector guests={guests} onChange={setGuests} />
        </div>
        <button type="submit" className="lsearch-btn">
          <Search style={{ width: 16, height: 16, marginRight: 6 }} />
          Search
        </button>
      </form>
    )
  }

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <div className="sbar-field">
        <label>Destination</label>
        <input
          type="text"
          placeholder="City, hotel name..."
          value={destination}
          onChange={e => setDestination(e.target.value)}
        />
      </div>
      <div className="sbar-field">
        <label>Check-in</label>
        <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)} style={{ colorScheme: 'light' }} />
      </div>
      <div className="sbar-field">
        <label>Check-out</label>
        <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)} style={{ colorScheme: 'light' }} />
      </div>
      <div className="sbar-field">
        <label>Guests</label>
        <GuestsSelector guests={guests} onChange={setGuests} />
      </div>
      <button type="submit" className="sbar-search">
        <Search style={{ width: 20, height: 20 }} />
      </button>
    </form>
  )
}
