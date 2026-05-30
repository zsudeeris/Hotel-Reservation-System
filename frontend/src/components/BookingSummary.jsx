import React from 'react'
import { useBooking } from '../context/BookingContext.jsx'

export default function BookingSummary({ showTotal = true }) {
  const { selectedHotel, selectedRoom, dateState, guestState, totalPrice } = useBooking()

  const checkin = dateState?.checkin ? new Date(dateState.checkin) : null
  const checkout = dateState?.checkout ? new Date(dateState.checkout) : null
  const nights = checkin && checkout ? Math.max(1, Math.round((checkout - checkin) / (1000 * 60 * 60 * 24))) : 1
  const pricePerNight = selectedRoom?.price_per_night || selectedRoom?.price || 0
  const roomTotal = pricePerNight * nights
  const taxes = Math.round(roomTotal * 0.1)
  const grandTotal = roomTotal + taxes

  const fmt = (d) => d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="order-card">
      {selectedHotel && (
        <>
          <div className="order-score-row">
            <div className="order-badge">{selectedHotel.score || '8.5'}</div>
            <div>
              <div className="order-score-txt">{selectedHotel.score >= 9 ? 'Exceptional' : 'Excellent'}</div>
            </div>
          </div>
          <div className="order-hotel-name">{selectedHotel.name}</div>
          <div className="order-hotel-loc">{selectedHotel.city}, Northern Cyprus</div>
        </>
      )}

      <div className="order-dates">
        {fmt(checkin)} → {fmt(checkout)}
      </div>
      <div className="order-checkin">{nights} night{nights !== 1 ? 's' : ''}</div>

      <div className="order-guests-row">
        {guestState?.adults || 2} Adults, {guestState?.children || 0} Children · {guestState?.rooms || 1} Room
      </div>

      {selectedRoom && (
        <div className="order-room-row">
          <img
            className="order-room-img"
            src={selectedRoom.image_url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&q=80'}
            alt={selectedRoom.room_type || 'Room'}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&q=80' }}
          />
          <div>
            <div className="order-room-name">{selectedRoom.room_type || selectedRoom.name}</div>
            <div className="order-room-tag">Up to {selectedRoom.capacity || 2} guests</div>
          </div>
        </div>
      )}

      {showTotal && (
        <>
          <div className="price-line">
            <span className="price-lbl">${pricePerNight} × {nights} nights</span>
            <span className="price-curr">${roomTotal}</span>
          </div>
          <div className="price-line">
            <span className="price-lbl">Taxes & fees (10%)</span>
            <span className="price-curr">${taxes}</span>
          </div>
          <div className="price-total-line">
            <span className="price-total-lbl">Total</span>
            <span className="price-total-val">${grandTotal}</span>
          </div>
        </>
      )}
    </div>
  )
}
