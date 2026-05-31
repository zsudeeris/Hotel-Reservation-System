import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { normalizeRoomPlans, normalizeRoomSelections, roomPlanTotals } from '../utils/bookingState.js'

const BookingContext = createContext(null)

function readBookingSnapshot() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem('bookhotel:bookingState')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function BookingProvider({ children }) {
  const snapshot = useMemo(() => readBookingSnapshot(), [])
  const [selectedHotel, setSelectedHotel] = useState(snapshot?.selectedHotel || null)
  const [selectedRoom, setSelectedRoom] = useState(snapshot?.selectedRoom || null)
  const [dateState, setDateState] = useState(snapshot?.dateState || { checkin: null, checkout: null })
  const [guestState, setGuestState] = useState(snapshot?.guestState || { adults: 2, children: 0, rooms: 1 })
  const [roomPlans, setRoomPlans] = useState(() => normalizeRoomPlans(snapshot?.roomPlans, {
    roomCount: snapshot?.guestState?.rooms || 1,
    totalAdults: snapshot?.guestState?.adults || 2,
    totalChildren: snapshot?.guestState?.children || 0,
  }))
  const [roomSelections, setRoomSelections] = useState(() => Array.isArray(snapshot?.roomSelections) ? snapshot.roomSelections : [])
  const [specialRequests, setSpecialRequests] = useState(snapshot?.specialRequests || '')
  const [reservationId, setReservationId] = useState(null)
  const [totalPrice, setTotalPrice] = useState(snapshot?.totalPrice || 0)

  const setHotel = (hotel) => setSelectedHotel(hotel)
  const setRoom = (room) => setSelectedRoom(room)
  const setDates = (dates) => setDateState(dates)
  const setGuests = (guests) => setGuestState(guests)

  useEffect(() => {
    if (!selectedHotel?.rooms) return
    setRoomSelections(prev => normalizeRoomSelections(prev, roomPlans, selectedHotel.rooms))
  }, [selectedHotel?.id, roomPlans])

  useEffect(() => {
    if (roomSelections && roomSelections.length > 0) {
      const firstRoom = roomSelections.map(selection => selection?.room).find(Boolean) || null
      if (firstRoom && selectedRoom?.id !== firstRoom.id) {
        setSelectedRoom(firstRoom)
      }
    }
  }, [roomSelections])

  useEffect(() => {
    const next = {
      selectedHotel,
      selectedRoom,
      dateState,
      guestState,
      roomPlans,
      roomSelections,
      specialRequests,
      reservationId,
      totalPrice,
    }
    try {
      window.sessionStorage.setItem('bookhotel:bookingState', JSON.stringify(next))
    } catch {}
  }, [selectedHotel, selectedRoom, dateState, guestState, roomPlans, roomSelections, specialRequests, reservationId, totalPrice])

  return (
    <BookingContext.Provider value={{
      selectedHotel, selectedRoom, dateState, guestState, roomPlans, roomSelections, specialRequests, reservationId, totalPrice,
      setHotel, setRoom, setDates, setGuests, setRoomPlans, setRoomSelections, setSpecialRequests, setReservationId, setTotalPrice,
      roomPlanTotals: () => roomPlanTotals(roomPlans),
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  return useContext(BookingContext)
}
