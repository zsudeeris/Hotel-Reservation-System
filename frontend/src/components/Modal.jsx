import React, { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, maxWidth = 520 }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 3000, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--white)', borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-lg)', padding: '28px 32px',
          width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto',
          animation: 'fadeUp .25s ease both'
        }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 20, lineHeight: 1, cursor: 'pointer', color: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
