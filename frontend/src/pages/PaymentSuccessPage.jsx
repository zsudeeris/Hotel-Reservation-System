import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Calendar, Home } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useBooking } from '../context/BookingContext.jsx'
import { getNights, normalizeRoomSelections, normalizeRoomPlans, roomPlanTotals } from '../utils/bookingState.js'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const { selectedHotel, selectedRoom, dateState, roomPlans, roomSelections, reservationId, totalPrice, guestState } = useBooking()

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const nights = getNights(dateState?.checkin, dateState?.checkout) || 1
  const resolvedRoomPlans = normalizeRoomPlans(roomPlans || [{ adults: guestState?.adults || 2, children: guestState?.children || 0 }])
  const totals = roomPlanTotals(resolvedRoomPlans)
  const resolvedRoomSelections = normalizeRoomSelections(roomSelections, resolvedRoomPlans, selectedHotel?.rooms || [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="confirm-steps">
        <div className="bstep"><div className="bstep-num" style={{ background: 'var(--green)', borderColor: 'var(--green)', color: '#fff' }}>✓</div>Guest Info</div>
        <div className="bstep-line" />
        <div className="bstep"><div className="bstep-num" style={{ background: 'var(--green)', borderColor: 'var(--green)', color: '#fff' }}>✓</div>Payment</div>
        <div className="bstep-line" />
        <div className="bstep active"><div className="bstep-num">3</div>Confirmation</div>
      </div>

      <div className="confirm-wrap">
        <div className="confirm-card">
          <div className="confirm-icon ok">
            <CheckCircle style={{ width: 36, height: 36 }} />
          </div>
          <h2 className="confirm-title">Booking Confirmed!</h2>
          <p className="confirm-sub">Your reservation has been successfully created.</p>
          <p className="confirm-sub2">A confirmation email has been sent to your registered address.</p>

          <div className="confirm-detail-box">
            <div className="confirm-detail-title">Booking Details</div>
            <div className="confirm-row">
              <span className="confirm-row-lbl">Booking ID</span>
              <span className="confirm-row-val">#{reservationId || 'BK' + Date.now().toString().slice(-6)}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-row-lbl">Hotel</span>
              <span className="confirm-row-val">{selectedHotel?.name || '—'}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-row-lbl">Room</span>
              <span className="confirm-row-val">
                {resolvedRoomSelections.length
                  ? resolvedRoomSelections.map((selection, index) => `Room ${index + 1}: ${selection.room?.room_type || selection.roomType || 'Unavailable'}`).join(' · ')
                  : selectedRoom?.room_type || selectedRoom?.name || 'Standard Room'}
              </span>
            </div>
            <div className="confirm-row">
              <span className="confirm-row-lbl">Rooms / Guests</span>
              <span className="confirm-row-val">{totals.roomCount} rooms, {totals.totalGuests} guests</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-row-lbl">Room Breakdown</span>
              <span className="confirm-row-val">
                {resolvedRoomSelections.length
                  ? resolvedRoomSelections.map((room, index) => `Room ${index + 1}: ${room.adults} adult${room.adults !== 1 ? 's' : ''}${room.children ? `, ${room.children} child${room.children !== 1 ? 'ren' : ''}` : ''} — ${room.room?.room_type || room.roomType || 'Unavailable'}`).join(' · ')
                  : '1 room, 2 adults'}
              </span>
            </div>
            <div className="confirm-row">
              <span className="confirm-row-lbl">Check-in</span>
              <span className="confirm-row-val">{fmt(dateState?.checkin)}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-row-lbl">Check-out</span>
              <span className="confirm-row-val">{fmt(dateState?.checkout)}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-row-lbl">Duration</span>
              <span className="confirm-row-val">{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-row-lbl">Total Paid</span>
              <span className="confirm-row-val big">${totalPrice || '—'}</span>
            </div>
          </div>

          <div className="confirm-notice">
            <div className="confirm-notice-ico"><CheckCircle style={{ width: 18, height: 18 }} /></div>
            <span>Free cancellation available up to 24 hours before check-in.</span>
          </div>

          <div className="confirm-btns">
            <button className="btn-cf-primary" onClick={() => navigate('/reservations')}>
              <Calendar style={{ width: 16, height: 16 }} />
              My Reservations
            </button>
            <button className="btn-cf-outline" onClick={() => navigate('/home')}>
              <Home style={{ width: 16, height: 16 }} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
