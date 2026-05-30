import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'score_desc', label: 'Rating: Highest' },
  { value: 'name_asc', label: 'Name: A–Z' },
]

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = OPTIONS.find(o => o.value === value) || OPTIONS[0]

  return (
    <div className="sort-wrap" ref={ref}>
      <button
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, fontWeight: 500, background: 'var(--white)', cursor: 'pointer', color: 'var(--text)' }}
        onClick={() => setOpen(o => !o)}
      >
        Sort: {current.label}
        <ChevronDown style={{ width: 14, height: 14 }} />
      </button>
      {open && (
        <div className="sort-menu">
          {OPTIONS.map(o => (
            <button
              key={o.value}
              className={value === o.value ? 'active' : ''}
              onClick={() => { onChange(o.value); setOpen(false) }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
