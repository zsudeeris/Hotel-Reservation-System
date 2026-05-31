import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

function localIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseLocalDate(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = String(dateStr).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export default function BookingDatePicker({
  value,
  onChange,
  placeholder = 'Date of birth',
  minDate = null,
  maxDate = localIso(new Date()),
  mode = 'birthDate',
}) {
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => {
    const base = parseLocalDate(value) || new Date()
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  const selectedDate = useMemo(() => parseLocalDate(value), [value])
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const min = minDate ? parseLocalDate(minDate) : null
  const max = maxDate ? parseLocalDate(maxDate) : null

  useEffect(() => {
    const handleOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => {
    if (open && selectedDate) {
      setMonth({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() })
    }
  }, [open, selectedDate])

  const monthTitle = new Date(month.year, month.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate()
  const leadingBlank = new Date(month.year, month.month, 1).getDay()
  const currentYear = today.getFullYear()
  const monthOptions = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ], [])
  const yearOptions = useMemo(() => {
    const minYear = min ? min.getFullYear() : 1900
    const maxYear = max ? max.getFullYear() : currentYear
    const list = []
    for (let year = maxYear; year >= minYear; year -= 1) list.push(year)
    return list
  }, [currentYear, max, min])

  const clearValue = () => {
    onChange('')
    setOpen(false)
  }

  const pickToday = () => {
    const todayStr = localIso(today)
    if (max && todayStr > localIso(max)) return
    if (min && todayStr < localIso(min)) return
    onChange(todayStr)
    setMonth({ year: today.getFullYear(), month: today.getMonth() })
    setOpen(false)
  }

  const pickDate = (dateStr) => {
    onChange(dateStr)
    setOpen(false)
  }

  const prevMonth = () => {
    setMonth(prev => {
      const next = new Date(prev.year, prev.month - 1, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const nextMonth = () => {
    setMonth(prev => {
      const next = new Date(prev.year, prev.month + 1, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const setMonthIndex = (nextMonthIndex) => {
    setMonth(prev => ({ ...prev, month: Number(nextMonthIndex) }))
  }

  const setYearValue = (nextYear) => {
    setMonth(prev => ({ ...prev, year: Number(nextYear) }))
  }

  const triggerLabel = value
    ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : placeholder

  const canShowToday = !max || localIso(today) <= localIso(max)

  return (
    <div className="booking-date-picker" ref={wrapRef}>
      <button
        type="button"
        className={`booking-date-trigger${open ? ' open' : ''}${value ? '' : ' muted'}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="booking-date-trigger-value">
          <Calendar style={{ width: 13, height: 13, flexShrink: 0 }} />
          <span>{triggerLabel}</span>
        </span>
        <ChevronDown style={{ width: 14, height: 14, flexShrink: 0 }} />
      </button>

      {open && (
        <div className="booking-date-popover">
          {mode === 'birthDate' ? (
            <div className="booking-date-head booking-date-head--selects">
              <select
                className="booking-date-select"
                value={month.month}
                onChange={e => setMonthIndex(e.target.value)}
                aria-label="Month"
              >
                {monthOptions.map((item, index) => (
                  <option key={item} value={index}>{item}</option>
                ))}
              </select>
              <select
                className="booking-date-select booking-date-select--year"
                value={month.year}
                onChange={e => setYearValue(e.target.value)}
                aria-label="Year"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="booking-date-head">
              <button type="button" className="booking-date-nav" onClick={prevMonth} aria-label="Previous month">
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>
              <div className="booking-date-title">{monthTitle}</div>
              <button type="button" className="booking-date-nav" onClick={nextMonth} aria-label="Next month">
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          )}

          <div className="booking-date-actions">
            <button type="button" className="booking-date-action" onClick={clearValue}>Clear</button>
            {canShowToday && <button type="button" className="booking-date-action secondary" onClick={pickToday}>Today</button>}
          </div>

          <div className="booking-date-weekdays">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="booking-date-grid">
            {Array.from({ length: leadingBlank }).map((_, index) => (
              <div key={`blank-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const date = new Date(month.year, month.month, day)
              const dateStr = localIso(date)
              const isPast = min ? date < min : false
              const isFuture = max ? date > max : false
              const disabled = isPast || isFuture
              const isToday = date.toDateString() === today.toDateString()
              const isSelected = value && dateStr === value

              let className = 'booking-date-day'
              if (disabled) className += ' disabled'
              if (isToday) className += ' today'
              if (isSelected) className += ' selected'

              return (
                <button
                  key={dateStr}
                  type="button"
                  className={className}
                  disabled={disabled}
                  onClick={() => pickDate(dateStr)}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
