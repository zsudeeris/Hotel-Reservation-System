import React, { useState, useEffect, useRef } from 'react'
import { registerToast } from '../hooks/useToast.js'

export default function Toast() {
  const [toasts, setToasts] = useState([])
  const counterRef = useRef(0)

  useEffect(() => {
    registerToast((message, duration = 3000) => {
      const id = ++counterRef.current
      setToasts(prev => [...prev, { id, message }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    })
  }, [])

  if (!toasts.length) return null

  return (
    <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>
  )
}
