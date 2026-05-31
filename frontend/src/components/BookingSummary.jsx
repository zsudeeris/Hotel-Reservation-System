import React from 'react'
import { useBooking } from '../context/BookingContext.jsx'
import { getHotelName } from '../utils/hotelRouting.js'
import { getNights, normalizeRoomPlans, roomPlanTotals, roomSelectionTotals, validateRoomSelections } from '../utils/bookingState.js'

function formatMoney(value) {
  return `EUR ${Number(value || 0).toFixed(0)}`
}

export default function BookingSummary({ showTotal = true }) {
  const { selectedHotel, dateState, guestState, roomPlans, roomSelections, extras } = useBooking()

  const checkin = dateState?.checkin ? new Date(dateState.checkin) : null
  const checkout = dateState?.checkout ? new Date(dateState.checkout) : null
  const nights = getNights(dateState?.checkin, dateState?.checkout)
  const hasValidDates = Boolean(dateState?.checkin && dateState?.checkout && checkout > checkin)
  const resolvedRoomPlans = normalizeRoomPlans(roomPlans || [{ adults: guestState?.adults || 2, children: guestState?.children || 0 }])
  const totals = roomPlanTotals(resolvedRoomPlans)
  const roomValidation = validateRoomSelections(roomSelections, resolvedRoomPlans, selectedHotel?.rooms || [])
  const resolvedRoomSelections = roomValidation.selections
  const calculated = roomValidation.isValid ? roomSelectionTotals(resolvedRoomSelections, nights) : { roomTotal: 0 }
  const roomTotal = calculated.roomTotal
  const airportPickupFee = extras?.airportPickup ? 25 : 0
  const extrasTotal = airportPickupFee
  const finalTotal = roomTotal + extrasTotal

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
          <div className="order-hotel-name">{getHotelName(selectedHotel)}</div>
          <div className="order-hotel-loc">{selectedHotel.city || selectedHotel.district || 'Northern Cyprus'}</div>
        </>
      )}

      <div className="order-dates">
        {fmt(checkin)} → {fmt(checkout)}
      </div>
      <div className="order-checkin">{hasValidDates ? `${nights} night${nights !== 1 ? 's' : ''}` : 'Select dates to see total'}</div>

      <div className="order-guests-row">
        {totals.roomCount} Room{totals.roomCount !== 1 ? 's' : ''} · {totals.totalGuests} Guest{totals.totalGuests !== 1 ? 's' : ''}
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
        {resolvedRoomSelections.length ? resolvedRoomSelections.map((selection, index) => (
          <div key={`room-plan-${index}`} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Room {index + 1}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>
              {selection.adults} adult{selection.adults !== 1 ? 's' : ''}{selection.children ? `, ${selection.children} child${selection.children !== 1 ? 'ren' : ''}` : ''}
            </div>
            <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4, fontWeight: 600 }}>
              {selection.room?.room_type || selection.roomType || 'Room type required'}
            </div>
          </div>
        )) : (
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)', fontSize: 12, color: 'var(--sub)' }}>
            1 room · 2 adults
          </div>
        )}
      </div>

      {resolvedRoomSelections.length === 1 && resolvedRoomSelections[0]?.room ? (
        <div className="order-room-row">
          <img
            className="order-room-img"
            src={resolvedRoomSelections[0].room.image_url || resolvedRoomSelections[0].room.img || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&q=80'}
            alt={resolvedRoomSelections[0].room.room_type || 'Room'}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&q=80' }}
          />
          <div>
            <div className="order-room-name">{resolvedRoomSelections[0].room.room_type || resolvedRoomSelections[0].room.name}</div>
            <div className="order-room-tag">Up to {resolvedRoomSelections[0].room.capacity || 2} guests</div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 12, lineHeight: 1.5 }}>
          {resolvedRoomSelections.length > 0
            ? resolvedRoomSelections.map((selection, index) => (
              <div key={`selection-summary-${index}`} style={{ marginBottom: 4 }}>
                Room {index + 1}: {selection.room?.room_type || selection.roomType || 'Unavailable'}
              </div>
            ))
            : null}
        </div>
      )}

      {showTotal && (
        <>
          <div style={{ display: 'grid', gap: 6, marginBottom: 10, fontSize: 12.5 }}>
            {extras?.airportPickup ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ color: 'var(--sub)' }}>Airport pickup shuttle</span>
                <strong style={{ color: 'var(--text)' }}>EUR {airportPickupFee.toFixed(0)}</strong>
              </div>
            ) : null}
          </div>
          <div className="price-line">
            <span className="price-lbl">{roomValidation.isValid ? `Selected rooms × ${nights} nights` : 'Select a room type for each room to see total'}</span>
            <span className="price-curr">{roomValidation.isValid ? formatMoney(roomTotal) : 'EUR 0'}</span>
          </div>
          <div className="price-total-line">
            <span className="price-total-lbl">Total</span>
            <span className="price-total-val">{roomValidation.isValid ? formatMoney(finalTotal) : 'EUR 0'}</span>
          </div>
        </>
      )}
    </div>
  )
}
