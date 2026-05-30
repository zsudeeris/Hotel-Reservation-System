import React, { createContext, useContext, useState } from 'react'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [dateState, setDateState] = useState({ checkin: null, checkout: null })
  const [guestState, setGuestState] = useState({ adults: 2, children: 0, rooms: 1 })
  const [reservationId, setReservationId] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)

  const setHotel = (hotel) => setSelectedHotel(hotel)
  const setRoom = (room) => setSelectedRoom(room)
  const setDates = (dates) => setDateState(dates)
  const setGuests = (guests) => setGuestState(guests)

  return (
    <BookingContext.Provider value={{
      selectedHotel, selectedRoom, dateState, guestState, reservationId, totalPrice,
      setHotel, setRoom, setDates, setGuests, setReservationId, setTotalPrice
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  return useContext(BookingContext)
}
