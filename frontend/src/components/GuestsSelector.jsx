import React, { useMemo, useState, useRef, useEffect } from 'react'
import { Users } from 'lucide-react'

function formatGuestsLabel(guests, compact = false) {
  const adults = Math.max(1, Number(guests?.adults) || 1)
  const children = Math.max(0, Number(guests?.children) || 0)
  const rooms = Math.max(1, Number(guests?.rooms) || 1)

  if (compact) {
    const parts = [`${adults} Adult${adults !== 1 ? 's' : ''}`]
    if (children > 0) parts.push(`${children} Child${children !== 1 ? 'ren' : ''}`)
    parts.push(`${rooms} Room${rooms !== 1 ? 's' : ''}`)
    return parts.join(' · ')
  }

  return `${adults} Adult${adults !== 1 ? 's' : ''}, ${children} Child${children !== 1 ? 'ren' : ''}, ${rooms} Room${rooms !== 1 ? 's' : ''}`
}

export default function GuestsSelector({ guests, onChange, touched = false, className = '', compactValue = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const update = (key, delta) => {
    const mins = { adults: 1, children: 0, rooms: 1 }
    onChange({ ...guests, [key]: Math.max(mins[key], (guests[key] || 0) + delta) })
  }

  const label = useMemo(() => formatGuestsLabel(guests, compactValue), [guests, compactValue])

  return (
    <div className={`guests-selector ${compactValue ? 'guests-selector--compact' : ''}`} ref={ref}>
      <button
        type="button"
        className={`dp-trigger ${className}`}
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, width: '100%' }}
      >
        <Users style={{ width: 13, height: 13, stroke: 'var(--muted)' }} />
        <span className={`dp-val guests-value ${compactValue ? 'guests-value--compact' : ''}`}>{touched ? label : 'Add guests'}</span>
      </button>
      {open && (
        <div className={`s-guest-picker ${compactValue ? 's-guest-picker--compact' : ''}`} style={{ minWidth: compactValue ? 242 : 260 }}>
          {[
            { key: 'adults', label: 'Adults', sub: 'Age 18+' },
            { key: 'children', label: 'Children', sub: 'Age 0–17' },
            { key: 'rooms', label: 'Rooms', sub: '' }
          ].map(({ key, label, sub }) => (
            <div className="s-guest-row" key={key}>
              <div>
                <div>{label}</div>
                {sub && <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>{sub}</div>}
              </div>
              <div className="s-guest-controls">
                <button type="button" onClick={() => update(key, -1)}>−</button>
                <strong>{guests[key]}</strong>
                <button type="button" onClick={() => update(key, 1)}>+</button>
              </div>
            </div>
          ))}
          <button className="s-guest-done" type="button" onClick={() => setOpen(false)}>Done</button>
        </div>
      )}
    </div>
  )
}
