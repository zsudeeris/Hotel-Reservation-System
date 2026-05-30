import { useState, useCallback } from 'react'

export function useDatePicker(initialCheckin = null, initialCheckout = null) {
  const [checkin, setCheckin] = useState(initialCheckin)
  const [checkout, setCheckout] = useState(initialCheckout)
  const [pickingCheckin, setPickingCheckin] = useState(false)
  const [pickingCheckout, setPickingCheckout] = useState(false)
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const openCheckinPicker = useCallback(() => {
    setPickingCheckin(true)
    setPickingCheckout(false)
  }, [])

  const openCheckoutPicker = useCallback(() => {
    setPickingCheckout(true)
    setPickingCheckin(false)
  }, [])

  const closePickers = useCallback(() => {
    setPickingCheckin(false)
    setPickingCheckout(false)
  }, [])

  const selectDate = useCallback((date) => {
    if (pickingCheckin) {
      setCheckin(date)
      setPickingCheckin(false)
      setPickingCheckout(true)
    } else if (pickingCheckout) {
      if (checkin && date <= checkin) {
        setCheckin(date)
      } else {
        setCheckout(date)
        setPickingCheckout(false)
      }
    }
  }, [pickingCheckin, pickingCheckout, checkin])

  const prevMonth = () => setCalMonth(m => {
    const d = new Date(m.year, m.month - 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const nextMonth = () => setCalMonth(m => {
    const d = new Date(m.year, m.month + 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const nightsBetween = (a, b) => {
    if (!a || !b) return 0
    const diff = new Date(b) - new Date(a)
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
  }

  return {
    checkin, checkout, setCheckin, setCheckout,
    pickingCheckin, pickingCheckout,
    openCheckinPicker, openCheckoutPicker, closePickers, selectDate,
    calMonth, prevMonth, nextMonth,
    getDaysInMonth, getFirstDayOfMonth,
    formatDate, nightsBetween
  }
}
