import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Car, Plus, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import BookingSummary from '../components/BookingSummary.jsx'
import NationalityAutocomplete from '../components/NationalityAutocomplete.jsx'
import BookingDatePicker from '../components/BookingDatePicker.jsx'
import { useBooking } from '../context/BookingContext.jsx'
import { createReservation, getHotelRooms } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getNights, normalizeRoomPlans, roomPlanTotals, roomSelectionTotals, validateRoomSelections } from '../utils/bookingState.js'
import { normalizeNationalityInput } from '../utils/nationality.js'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function BookingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    selectedHotel,
    dateState,
    guestState,
    roomPlans,
    roomSelections,
    specialRequests,
    setExtras: setBookingExtras,
    setSpecialRequests,
    setReservationId,
    setTotalPrice
  } = useBooking()

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
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')

  const set = (k) => (e) => setGuestInfo(g => ({ ...g, [k]: e.target.value }))
  const handleEmailChange = (e) => {
    const nextEmail = e.target.value
    setGuestInfo(g => ({ ...g, email: nextEmail }))
    if (emailTouched) {
      const trimmed = nextEmail.trim()
      setEmailError(trimmed && emailRegex.test(trimmed) ? '' : 'Please enter a valid email address.')
    }
  }
  const handleEmailBlur = () => {
    setEmailTouched(true)
    const trimmed = guestInfo.email.trim()
    setEmailError(trimmed && emailRegex.test(trimmed) ? '' : 'Please enter a valid email address.')
  }
  const setExtra = (k) => (e) => {
    setExtras(ex => {
      const next = { ...ex, [k]: e.target.checked }
      setBookingExtras({ ...next, airportPickupFee: next.airportPickup ? 25 : 0 })
      return next
    })
  }

  const nights = getNights(dateState?.checkin, dateState?.checkout)
  const hasValidDates = Boolean(dateState?.checkin && dateState?.checkout && dateState.checkout > dateState.checkin)
  const resolvedRoomPlans = normalizeRoomPlans(roomPlans, {
    roomCount: guestState?.rooms || 1,
    totalAdults: guestState?.adults || 2,
    totalChildren: guestState?.children || 0,
  })
  const totals = roomPlanTotals(resolvedRoomPlans)
  const roomValidation = validateRoomSelections(roomSelections, resolvedRoomPlans, selectedHotel?.rooms || [])
  const resolvedRoomSelections = roomValidation.selections
  const roomTotal = roomValidation.isValid ? roomSelectionTotals(resolvedRoomSelections, nights).roomTotal : 0
  const airportPickupFee = extras.airportPickup ? 25 : 0
  const finalTotal = roomTotal + airportPickupFee

  const handleProceed = async () => {
    const trimmedEmail = guestInfo.email.trim()
    if (!guestInfo.name || !trimmedEmail) { setError('Please fill in required guest information.'); return }
    if (!emailRegex.test(trimmedEmail)) {
      setEmailTouched(true)
      setEmailError('Please enter a valid email address.')
      setError('')
      return
    }
    const normalizedNationality = normalizeNationalityInput(guestInfo.nationality)
    if (!normalizedNationality) {
      setError('Please select or enter a nationality.')
      return
    }
    if (!hasValidDates) {
      setError('Please select check-in and check-out dates before continuing.')
      return
    }
    if (!selectedHotel) {
      setError('No hotel selected. Please go back and choose a hotel.')
      return
    }
    if (!roomValidation.isValid) {
      setError(`Please select a room type for Room ${roomValidation.firstInvalidRoomNumber}.`)
      return
    }
    setGuestInfo(g => ({ ...g, email: trimmedEmail, nationality: normalizedNationality }))
    setEmailError('')
    setBookingExtras({ ...extras, airportPickupFee })
    setLoading(true)
    setError('')
    try {
      const latestRooms = await getHotelRooms(selectedHotel.id, {
        checkin: dateState?.checkin,
        checkout: dateState?.checkout,
      })
      const latestRoomMap = new Map(
        (Array.isArray(latestRooms) ? latestRooms : []).map(room => [String(room.id), room])
      )
      const unavailableSelection = resolvedRoomSelections.find((selection) => {
        const latestRoom = latestRoomMap.get(String(selection.room?.id ?? selection.roomId))
        if (!latestRoom || latestRoom.available === false) return true
        return Number(latestRoom.capacity || latestRoom.max_guests || 0) < Number(selection.guests || 0)
      })
      if (unavailableSelection) {
        setError('Selected room is not available for these dates.')
        return
      }

      const roomAllocations = resolvedRoomSelections.map(selection => ({
        room_id: selection.room?.id ?? selection.roomId,
        room_type: selection.room?.room_type || selection.roomType || selection.room?.name || 'Room',
        capacity: selection.room?.capacity || selection.capacity || 0,
        price_per_night: selection.room?.price_per_night || selection.pricePerNight || 0,
        adults: selection.adults,
        children: selection.children,
        guests: selection.guests,
      }))
      const data = await createReservation({
        hotel_id: selectedHotel.id,
        room_id: roomAllocations[0]?.room_id,
        check_in_date: dateState?.checkin,
        check_out_date: dateState?.checkout,
        checkin_date: dateState?.checkin,
        checkout_date: dateState?.checkout,
        guest_count: totals.totalGuests,
        adults: totals.totalAdults,
        children: totals.totalChildren,
        rooms: totals.roomCount,
        guest_name: guestInfo.name,
        guest_surname: guestInfo.surname,
        guest_email: trimmedEmail,
        guest_phone: guestInfo.phone,
        guest_nationality: normalizedNationality,
        room_count: totals.roomCount,
        total_adults: totals.totalAdults,
        total_children: totals.totalChildren,
        room_allocations: roomAllocations,
        special_requests: specialRequests.trim(),
        extras: { ...extras, airportPickupFee },
        total_price: finalTotal,
      })
      console.log('Reservation payload:', {
        hotel_id: selectedHotel.id,
        room_id: roomAllocations[0]?.room_id,
        check_in_date: dateState?.checkin,
        check_out_date: dateState?.checkout,
        guest_count: totals.totalGuests,
        room_count: totals.roomCount,
        total_price: finalTotal,
        room_allocations: roomAllocations,
        extras: { ...extras, airportPickupFee },
      })
      if (data.error) { setError(data.error); return }
      setReservationId(data.reservation_id || data.id)
      setTotalPrice(finalTotal)
      navigate('/payment')
    } catch (err) {
      setError(err?.message || 'Failed to create reservation. Please try again.')
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
                <div>
                  <input
                    className={`form-inp${emailError ? ' error' : ''}`}
                    type="email"
                    placeholder="Email *"
                    value={guestInfo.email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    required
                  />
                  {emailError && <div className="field-error" style={{ marginTop: 6 }}>{emailError}</div>}
                </div>
                <input className="form-inp" type="tel" placeholder="Phone" value={guestInfo.phone} onChange={set('phone')} />
                <NationalityAutocomplete
                  value={guestInfo.nationality}
                  onChange={(next) => {
                    setGuestInfo(g => ({ ...g, nationality: next }))
                    setError('')
                  }}
                  onBlur={() => setError('')}
                  placeholder="Nationality *"
                />
                <BookingDatePicker
                  value={guestInfo.birthDate}
                  onChange={(next) => setGuestInfo(g => ({ ...g, birthDate: next }))}
                  placeholder="Date of birth"
                />
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
                Airport pickup shuttle (+EUR 25)
              </label>
            </div>
          </div>

          <div className="bcard">
            <div className="bcard-title">Special Requests</div>
            <div className="bcard-sub">
              Let the hotel know about any special requests. Requests are subject to availability.
            </div>
            <textarea
              className="form-inp special-req-input"
              placeholder="Example: late check-in, extra bed, room preference, allergy information..."
              value={specialRequests}
              onChange={e => setSpecialRequests(e.target.value)}
              rows={5}
            />
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
