import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { normalizeSearchText } from '../utils/searchUi.js'
import { normalizeNationalityInput, searchNationalityOptions } from '../utils/nationality.js'

export default function NationalityAutocomplete({ value, onChange, placeholder = 'Nationality', error = '', onBlur }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const suggestions = useMemo(() => searchNationalityOptions(value, 8), [value])

  useEffect(() => {
    const handleOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleSelect = (option) => {
    onChange(option.value)
    setOpen(false)
  }

  const handleBlur = () => {
    const normalized = normalizeNationalityInput(value)
    if (normalized !== value) onChange(normalized)
    setTimeout(() => setOpen(false), 120)
    onBlur?.(normalized)
  }

  const matchText = normalizeSearchText(value)
  const shouldShow = open && matchText.length > 0

  return (
    <div className="nationality-wrap" ref={wrapRef}>
      <div className={`nationality-input-wrap${error ? ' error' : ''}`}>
        <input
          className={`nationality-input${error ? ' error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={e => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          autoComplete="off"
        />
        <button
          type="button"
          className="nationality-toggle"
          onClick={() => setOpen(next => !next)}
          aria-label="Toggle nationality suggestions"
          tabIndex={-1}
        >
          <ChevronDown style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {shouldShow && (
        <div className="nationality-drop">
          {suggestions.length ? suggestions.map(option => (
            <button
              key={option.value}
              type="button"
              className="nationality-item"
              onMouseDown={(event) => {
                event.preventDefault()
                handleSelect(option)
              }}
            >
              <span className="nationality-item-label">{option.label}</span>
              {option.aliases?.length > 0 && (
                <span className="nationality-item-sub">{option.aliases[0]}</span>
              )}
            </button>
          )) : (
            <div className="nationality-empty">No nationality found</div>
          )}
        </div>
      )}
    </div>
  )
}
