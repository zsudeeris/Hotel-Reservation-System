import React, { useState, useRef, useEffect } from 'react'
import { Users } from 'lucide-react'

export default function GuestsSelector({ guests, onChange, className = '' }) {
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

  const label = `${guests.adults} Adult${guests.adults !== 1 ? 's' : ''}, ${guests.children} Child${guests.children !== 1 ? 'ren' : ''}, ${guests.rooms} Room${guests.rooms !== 1 ? 's' : ''}`

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        type="button"
        className={`dp-trigger ${className}`}
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
      >
        <Users style={{ width: 13, height: 13, stroke: 'var(--muted)' }} />
        <span className="dp-val">{label}</span>
      </button>
      {open && (
        <div className="s-guest-picker" style={{ minWidth: 260 }}>
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
