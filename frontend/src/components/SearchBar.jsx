import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import GuestsSelector from './GuestsSelector.jsx'
import { getHotels } from '../services/api.js'
import { DEMO_HOTELS } from '../data/demoHotels.js'
import {
  addDays,
  buildDestinationSuggestions,
  formatDateLabel,
  matchDestinationSuggestions,
  startOfDay,
} from '../utils/searchUi.js'

function localIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseLocalDate(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function DatePopover({
  field,
  month,
  checkin,
  checkout,
  onPrevMonth,
  onNextMonth,
  onPick,
}) {
  const selectedCheckin = parseLocalDate(checkin)
  const selectedCheckout = parseLocalDate(checkout)
  const today = startOfDay(new Date())
  const first = new Date(month.year, month.month, 1)
  const dim = new Date(month.year, month.month + 1, 0).getDate()
  const start = (first.getDay() + 6) % 7
  const monthName = first.toLocaleString('en', { month: 'long', year: 'numeric' })
  const minDate = today
  const maxCheckin = selectedCheckout && field === 'checkin' ? selectedCheckout : null
  const minCheckout = selectedCheckin && field === 'checkout' ? addDays(selectedCheckin, 1) : minDate

  const weekdayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const cells = []
  for (let i = 0; i < start; i += 1) cells.push(<div key={`empty-${i}`} />)

  for (let d = 1; d <= dim; d += 1) {
    const date = new Date(month.year, month.month, d)
    const dateStr = localIso(date)
    const isPast = date < minDate
    const isAfterCheckout = field === 'checkin' && maxCheckin && date >= maxCheckin
    const isBeforeCheckoutMin = field === 'checkout' && date < minCheckout
    const disabled = isPast || isAfterCheckout || isBeforeCheckoutMin
    const isSelected = (checkin && dateStr === checkin) || (checkout && dateStr === checkout)
    const isRange = checkin && checkout && dateStr > checkin && dateStr < checkout

    let className = 'dp-day'
    if (disabled) className += ' dp-dis'
    if (date.toDateString() === today.toDateString()) className += ' dp-today'
    if (isSelected) className += ' dp-sel'
    else if (isRange) className += ' dp-range'

    cells.push(
      <div
        key={dateStr}
        className={className}
        onClick={disabled ? undefined : () => onPick(dateStr)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={disabled ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') onPick(dateStr) }}
      >
        {d}
      </div>
    )
  }

  return (
    <div
      className="custom-dp search-calendar-popover"
      style={{ display: 'block', position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: 'min(320px, calc(100vw - 24px))' }}
    >
      <div className="dp-head">
        <button type="button" className="dp-nav-btn" onClick={onPrevMonth}><ChevronLeft style={{ width: 16, height: 16 }} /></button>
        <span className="dp-month-lbl">{monthName}</span>
        <button type="button" className="dp-nav-btn" onClick={onNextMonth}><ChevronRight style={{ width: 16, height: 16 }} /></button>
      </div>
      <div className="dp-hint">{field === 'checkout' ? 'Check-out' : 'Check-in'}</div>
      <div className="dp-grid">
        {weekdayLabels.map(d => <div key={d} className="dp-dh">{d}</div>)}
        {cells}
      </div>
    </div>
  )
}

export default function SearchBar({ initialValues = {}, variant = 'home' }) {
  const navigate = useNavigate()
  const today = useMemo(() => localIso(new Date()), [])
  const [destination, setDestination] = useState(initialValues.q || '')
  const [checkin, setCheckin] = useState(initialValues.checkin || '')
  const [checkout, setCheckout] = useState(initialValues.checkout || '')
  const [guests, setGuests] = useState({
    adults: parseInt(initialValues.adults) || 2,
    children: parseInt(initialValues.children) || 0,
    rooms: parseInt(initialValues.rooms) || 1,
  })
  const [guestsTouched, setGuestsTouched] = useState(
    initialValues.guestTouched === true ||
    initialValues.guestTouched === '1' ||
    initialValues.guestTouched === 1
  )
  const [dateError, setDateError] = useState('')
  const [destOpen, setDestOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = parseLocalDate(initialValues.checkin || initialValues.checkout || today) || new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [hotels, setHotels] = useState([])
  const destWrapRef = useRef(null)
  const dateWrapRef = useRef(null)

  useEffect(() => {
    let alive = true
    getHotels()
      .then(data => {
        if (!alive) return
        const list = Array.isArray(data) ? data : (data.hotels || data.results || [])
        setHotels(list.length > 0 ? list : DEMO_HOTELS)
      })
      .catch(() => {
        if (alive) setHotels(DEMO_HOTELS)
      })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (destWrapRef.current && !destWrapRef.current.contains(e.target)) setDestOpen(false)
      if (dateWrapRef.current && !dateWrapRef.current.contains(e.target)) setCalendarOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const destinationSuggestions = useMemo(
    () => buildDestinationSuggestions(hotels.length ? hotels : DEMO_HOTELS),
    [hotels]
  )
  const filteredSuggestions = useMemo(
    () => matchDestinationSuggestions(destination, destinationSuggestions, 8),
    [destination, destinationSuggestions]
  )

  const openCalendar = (field) => {
    if (calendarOpen === field) {
      setCalendarOpen(null)
      return
    }
    const base = field === 'checkout'
      ? (checkout || checkin || today)
      : (checkin || today)
    const baseDate = parseLocalDate(base) || new Date()
    setCalendarMonth({ year: baseDate.getFullYear(), month: baseDate.getMonth() })
    setCalendarOpen(field)
    setDateError('')
  }

  const handleDatePick = (field, dateStr) => {
    setDateError('')
    if (field === 'checkin') {
      setCheckin(dateStr)
      if (checkout && checkout <= dateStr) setCheckout('')
      setCalendarOpen('checkout')
      const next = parseLocalDate(dateStr) || new Date()
      setCalendarMonth({ year: next.getFullYear(), month: next.getMonth() })
      return
    }

    if (checkin && dateStr <= checkin) {
      setDateError('Check-out must be after check-in.')
      return
    }
    setCheckout(dateStr)
    setCalendarOpen(null)
  }

  const shiftMonth = (delta) => {
    setCalendarMonth(prev => {
      const next = new Date(prev.year, prev.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (checkin && checkout && checkout <= checkin) {
      setDateError('Check-out must be after check-in.')
      return
    }
    const searchState = {
      q: destination,
      checkin,
      checkout,
      adults: guests.adults,
      children: guests.children,
      rooms: guests.rooms,
    }
    try {
      sessionStorage.setItem('bookhotel:lastSearch', JSON.stringify(searchState))
    } catch {}

    const params = new URLSearchParams({
      ...(destination ? { q: destination } : {}),
      ...(checkin ? { checkin } : {}),
      ...(checkout ? { checkout } : {}),
      adults: String(guests.adults),
      children: String(guests.children),
      rooms: String(guests.rooms),
      guestTouched: guestsTouched ? '1' : '0',
    })
    navigate('/search?' + params.toString())
  }

  const renderDateField = (field) => {
    const value = field === 'checkin' ? checkin : checkout
    return (
      <div className="search-date-wrap" ref={calendarOpen === field ? dateWrapRef : null}>
        <button
          type="button"
          className="dp-trigger search-date-trigger"
          onClick={() => openCalendar(field)}
          aria-expanded={calendarOpen === field}
        >
          <span className={value ? 'dp-val' : 'dp-val muted'}>{formatDateLabel(value)}</span>
        </button>
        {calendarOpen === field && (
          <DatePopover
            field={calendarOpen}
            month={calendarMonth}
            checkin={checkin}
            checkout={checkout}
            onPrevMonth={() => shiftMonth(-1)}
            onNextMonth={() => shiftMonth(1)}
            onPick={(dateStr) => handleDatePick(calendarOpen, dateStr)}
          />
        )}
      </div>
    )
  }

  const renderDestinationSuggestions = () => {
    if (!destOpen || !destination.trim()) return null
    return (
      <div className="dest-drop" style={{ display: 'block' }}>
        {filteredSuggestions.length ? filteredSuggestions.map(s => (
          <div
            key={`${s.type}-${s.label}`}
            className="dest-drop-item"
            onMouseDown={(e) => {
              e.preventDefault()
              setDestination(s.value)
              setDestOpen(false)
            }}
          >
            <MapPin className="dest-pin" style={{ width: 13, height: 13 }} />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span>{s.label}</span>
              {s.type === 'hotel' && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Hotel</span>}
            </div>
          </div>
        )) : (
          <div className="dest-drop-empty">No results found</div>
        )}
      </div>
    )
  }

  const searchClass = variant === 'landing' ? 'lsearch' : 'search-bar'
  const shellClass = variant === 'detail' ? 'search-bar-shell detail-search-shell' : 'search-bar-shell'

  return (
    <div className={shellClass}>
      <form className={searchClass} onSubmit={handleSearch}>
        <div className={variant === 'landing' ? 'lsearch-field search-dest-wrap' : 'sbar-field search-dest-wrap'} ref={destWrapRef}>
          <label>
            <MapPin style={{ width: 11, height: 11, marginRight: 4 }} />
            {variant === 'landing' ? 'Destination' : 'Destination'}
          </label>
          <input
            type="text"
            placeholder={variant === 'landing' ? 'Where are you going?' : 'City, hotel name...'}
            value={destination}
            onChange={e => {
              setDestination(e.target.value)
              setDestOpen(true)
              setDateError('')
            }}
            onFocus={() => setDestOpen(true)}
            autoComplete="off"
          />
          {renderDestinationSuggestions()}
        </div>
        <div className={variant === 'landing' ? 'lsearch-field search-date-wrap' : 'sbar-field search-date-wrap'}>
          <label>
            <Calendar style={{ width: 11, height: 11, marginRight: 4 }} />
            Check-in
          </label>
          {renderDateField('checkin')}
        </div>
        <div className={variant === 'landing' ? 'lsearch-field search-date-wrap' : 'sbar-field search-date-wrap'}>
          <label>
            <Calendar style={{ width: 11, height: 11, marginRight: 4 }} />
            Check-out
          </label>
          {renderDateField('checkout')}
        </div>
        <div className={variant === 'landing' ? 'lsearch-field' : 'sbar-field'}>
          <label>
            <Search style={{ width: 11, height: 11, marginRight: 4 }} />
            Guests
          </label>
          <GuestsSelector
            guests={guests}
            touched={guestsTouched}
            compactValue={variant === 'landing'}
            onChange={(next) => { setGuests(next); setGuestsTouched(true); setDateError('') }}
          />
        </div>

        <button type="submit" className={variant === 'landing' ? 'lsearch-btn' : 'sbar-search'}>
          {variant === 'landing' ? <><Search style={{ width: 16, height: 16, marginRight: 6 }} />Search</> : <Search style={{ width: 20, height: 20 }} />}
        </button>
      </form>
      {dateError && <div className="search-validation-msg">{dateError}</div>}
    </div>
  )
}
