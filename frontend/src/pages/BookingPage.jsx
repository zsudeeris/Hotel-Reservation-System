import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Car, Plus, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import BookingSummary from '../components/BookingSummary.jsx'
import { useBooking } from '../context/BookingContext.jsx'
import { createReservation } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function BookingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedHotel, selectedRoom, dateState, guestState, setReservationId, setTotalPrice } = useBooking()

  const [guestInfo, setGuestInfo] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nationality: '',
    gender: 'male',
    birthDate: ''
  })
  const [flights, setFlights] = useState([])
  const [transfers, setTransfers] = useState([])
  const [showFlight, setShowFlight] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [flightForm, setFlightForm] = useState({ number: '', arrival: '', departure: '' })
  const [transferForm, setTransferForm] = useState({ type: 'Airport Transfer', pickup: '', dropoff: '' })
  const [extras, setExtras] = useState({ earlyCheckin: false, lateCheckout: false, airportPickup: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setGuestInfo(g => ({ ...g, [k]: e.target.value }))
  const setExtra = (k) => (e) => setExtras(ex => ({ ...ex, [k]: e.target.checked }))

  const nights = dateState?.checkin && dateState?.checkout
    ? Math.max(1, Math.round((new Date(dateState.checkout) - new Date(dateState.checkin)) / (1000 * 60 * 60 * 24)))
    : 1
  const pricePerNight = selectedRoom?.price_per_night || selectedRoom?.price || 0
  const roomTotal = pricePerNight * nights
  const taxes = Math.round(roomTotal * 0.1)
  const grandTotal = roomTotal + taxes

  const handleProceed = async () => {
    if (!guestInfo.name || !guestInfo.email) { setError('Please fill in required guest information.'); return }
    if (!selectedHotel || !selectedRoom) { setError('No hotel or room selected. Please go back and select a room.'); return }
    setLoading(true)
    setError('')
    try {
      const data = await createReservation({
        hotel_id: selectedHotel.id,
        room_id: selectedRoom.id,
        checkin_date: dateState?.checkin,
        checkout_date: dateState?.checkout,
        adults: guestState?.adults || 2,
        children: guestState?.children || 0,
        rooms: guestState?.rooms || 1,
        guest_name: guestInfo.name,
        guest_surname: guestInfo.surname,
        guest_email: guestInfo.email,
        guest_phone: guestInfo.phone,
        extras
      })
      if (data.error) { setError(data.error); return }
      setReservationId(data.reservation_id || data.id)
      setTotalPrice(grandTotal)
      navigate('/payment')
    } catch {
      setError('Failed to create reservation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <div className="booking-steps">
        <div className="bstep active"><div className="bstep-num">1</div>Guest Info</div>
        <div className="bstep-line" />
        <div className="bstep"><div className="bstep-num">2</div>Payment</div>
        <div className="bstep-line" />
        <div className="bstep"><div className="bstep-num">3</div>Confirmation</div>
      </div>

      <div className="booking-layout">
        <div>
          {/* Transport */}
          <div className="bcard">
            <div className="bcard-title">Transport Options</div>
            <div className="bcard-sub">Add your flight or transfer details (optional)</div>
            <div className="add-btns">
              <button className="add-btn" onClick={() => setShowFlight(s => !s)}>
                <Plane style={{ width: 14, height: 14 }} />
                Add Flight
              </button>
              <button className="add-btn" onClick={() => setShowTransfer(s => !s)}>
                <Car style={{ width: 14, height: 14 }} />
                Add Transfer
              </button>
            </div>

            {showFlight && (
              <div className="transport-form">
                <div className="transport-title">Flight Details</div>
                <div className="form-grid">
                  <input className="form-inp" placeholder="Flight number" value={flightForm.number} onChange={e => setFlightForm(f => ({ ...f, number: e.target.value }))} />
                  <input className="form-inp" type="datetime-local" placeholder="Arrival" value={flightForm.arrival} onChange={e => setFlightForm(f => ({ ...f, arrival: e.target.value }))} />
                  <input className="form-inp form-inp full" placeholder="Departure airport/city" value={flightForm.departure} onChange={e => setFlightForm(f => ({ ...f, departure: e.target.value }))} />
                </div>
                <div className="transport-actions">
                  <button className="mini-action" onClick={() => { setFlights(fs => [...fs, flightForm]); setFlightForm({ number: '', arrival: '', departure: '' }); setShowFlight(false) }}>Add</button>
                  <button className="mini-action secondary" onClick={() => setShowFlight(false)}>Cancel</button>
                </div>
              </div>
            )}

            {showTransfer && (
              <div className="transport-form">
                <div className="transport-title">Transfer Details</div>
                <div className="form-grid">
                  <input className="form-inp" placeholder="From" value={transferForm.pickup} onChange={e => setTransferForm(f => ({ ...f, pickup: e.target.value }))} />
                  <input className="form-inp" placeholder="To" value={transferForm.dropoff} onChange={e => setTransferForm(f => ({ ...f, dropoff: e.target.value }))} />
                </div>
                <div className="transport-actions">
                  <button className="mini-action" onClick={() => { setTransfers(ts => [...ts, transferForm]); setTransferForm({ type: 'Airport Transfer', pickup: '', dropoff: '' }); setShowTransfer(false) }}>Add</button>
                  <button className="mini-action secondary" onClick={() => setShowTransfer(false)}>Cancel</button>
                </div>
              </div>
            )}

            {(flights.length > 0 || transfers.length > 0) && (
              <div className="transport-list">
                {flights.map((f, i) => (
                  <div key={i} className="transport-item">
                    <div><strong>✈ Flight {f.number}</strong><br />{f.departure} → Arrival: {f.arrival}</div>
                    <div className="transport-actions">
                      <button className="mini-action secondary" onClick={() => setFlights(fs => fs.filter((_, j) => j !== i))}>
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                ))}
                {transfers.map((t, i) => (
                  <div key={i} className="transport-item">
                    <div><strong>🚗 Transfer</strong><br />{t.pickup} → {t.dropoff}</div>
                    <div className="transport-actions">
                      <button className="mini-action secondary" onClick={() => setTransfers(ts => ts.filter((_, j) => j !== i))}>
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guest Info */}
          <div className="bcard">
            <div className="bcard-title">Guest Information</div>
            <div className="guest-section">
              <div className="guest-sec-title">Primary Guest</div>
              <div className="guest-sec-badge">This information will be used for check-in</div>
              <div className="gender-row">
                <label className="gender-opt"><input type="radio" name="gender" value="male" checked={guestInfo.gender === 'male'} onChange={set('gender')} /> Mr.</label>
                <label className="gender-opt"><input type="radio" name="gender" value="female" checked={guestInfo.gender === 'female'} onChange={set('gender')} /> Ms.</label>
              </div>
              <div className="form-grid">
                <input className="form-inp" placeholder="First name *" value={guestInfo.name} onChange={set('name')} required />
                <input className="form-inp" placeholder="Last name *" value={guestInfo.surname} onChange={set('surname')} required />
                <input className="form-inp" type="email" placeholder="Email *" value={guestInfo.email} onChange={set('email')} required />
                <input className="form-inp" type="tel" placeholder="Phone" value={guestInfo.phone} onChange={set('phone')} />
                <input className="form-inp" placeholder="Nationality" value={guestInfo.nationality} onChange={set('nationality')} />
                <input className="form-inp" type="date" placeholder="Date of birth" value={guestInfo.birthDate} onChange={set('birthDate')} />
              </div>
            </div>

            <div className="extras-checks">
              <label className="extra-chk">
                <input type="checkbox" checked={extras.earlyCheckin} onChange={setExtra('earlyCheckin')} />
                Early check-in (subject to availability)
              </label>
              <label className="extra-chk">
                <input type="checkbox" checked={extras.lateCheckout} onChange={setExtra('lateCheckout')} />
                Late check-out (subject to availability)
              </label>
              <label className="extra-chk">
                <input type="checkbox" checked={extras.airportPickup} onChange={setExtra('airportPickup')} />
                Airport pickup shuttle (+$25)
              </label>
            </div>
          </div>

          {error && <div className="ferr show" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn-proceed" onClick={handleProceed} disabled={loading}>
            {loading ? 'Processing...' : 'Proceed to Payment →'}
          </button>
        </div>

        <BookingSummary />
      </div>
    </div>
  )
}
