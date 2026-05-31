import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import PaymentForm from '../components/PaymentForm.jsx'
import BookingSummary from '../components/BookingSummary.jsx'
import { useBooking } from '../context/BookingContext.jsx'
import { processPayment } from '../services/api.js'

export default function PaymentPage() {
  const navigate = useNavigate()
  const { reservationId, totalPrice } = useBooking()
  const [loading, setLoading] = useState(false)

  const handlePayment = async (cardData) => {
    setLoading(true)
    try {
      const data = await processPayment({
        reservation_id: reservationId,
        amount: totalPrice,
        ...cardData
      })
      if (data.error) {
        navigate('/booking/failed')
      } else {
        navigate('/booking/success')
      }
    } catch {
      navigate('/booking/failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <div className="booking-steps">
        <div className="bstep"><div className="bstep-num" style={{ background: 'var(--green)', borderColor: 'var(--green)', color: '#fff' }}>✓</div>Guest Info</div>
        <div className="bstep-line" />
        <div className="bstep active"><div className="bstep-num">2</div>Payment</div>
        <div className="bstep-line" />
        <div className="bstep"><div className="bstep-num">3</div>Confirmation</div>
      </div>

      <div className="booking-layout">
        <div>
          <div className="bcard">
            {loading ? (
              <div className="page-loading" style={{ minHeight: 200 }}>Processing payment...</div>
            ) : (
              <PaymentForm onSubmit={handlePayment} />
            )}
          </div>
        </div>
        <BookingSummary />
      </div>

      <Footer />
    </div>
  )
}
