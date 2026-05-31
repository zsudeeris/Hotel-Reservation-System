import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, XCircle, CheckCircle, Clock } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { getReservations, cancelReservation, deleteReservation } from '../services/api.js'
import { getHotelDetailPath } from '../utils/hotelRouting.js'
import { useToast } from '../hooks/useToast.js'

const STATUS_COLORS = {
  confirmed: { bg: 'var(--green-badge)', color: 'var(--green-dark)', icon: CheckCircle },
  pending: { bg: 'var(--bg)', color: 'var(--sub)', icon: Clock },
  cancelled: { bg: 'var(--red-light)', color: 'var(--red)', icon: XCircle },
}

export default function MyReservationsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    getReservations()
      .then(data => {
        const list = Array.isArray(data) ? data : (data.reservations || [])
        setReservations(list)
      })
      .catch(() => setReservations([]))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return
    setCancelling(id)
    try {
      const data = await cancelReservation(id)
      if (data.error) { showToast('Failed to cancel: ' + data.error); return }
      setReservations(rs => rs.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
      showToast('Reservation cancelled successfully.')
    } catch {
      showToast('Failed to cancel reservation.')
    } finally {
      setCancelling(null)
    }
  }

  const handleRemove = async (id) => {
    if (!confirm('Remove this cancelled reservation from your list?')) return
    setCancelling(id)
    try {
      const data = await deleteReservation(id)
      if (data.error) { showToast('Failed to remove: ' + data.error); return }
      setReservations(rs => rs.filter(r => r.id !== id))
      showToast('Reservation removed from your list.')
    } catch (err) {
      console.error('Failed to remove reservation:', err)
      showToast(err?.message || 'Failed to remove reservation.')
    } finally {
      setCancelling(null)
    }
  }

  const fmt = (d) => {
    if (!d) return '—'
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const parseAllocations = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value !== 'string') return []
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Calendar style={{ width: 28, height: 28, stroke: 'var(--green)' }} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Reservations</h1>
            <p style={{ color: 'var(--sub)', fontSize: 13, margin: '4px 0 0' }}>{reservations.length} booking{reservations.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className="page-loading">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--white)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <Calendar style={{ width: 56, height: 56, stroke: 'var(--border)', marginBottom: 20 }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No reservations yet</h3>
            <p style={{ color: 'var(--sub)', marginBottom: 24 }}>Book your first stay in Northern Cyprus!</p>
            <button className="btn-view-rooms" onClick={() => navigate('/home')}>Browse Hotels</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reservations.map(res => {
              const status = (res.status || 'confirmed').toLowerCase()
              const sc = STATUS_COLORS[status] || STATUS_COLORS.pending
              const StatusIcon = sc.icon
              const allocations = parseAllocations(res.room_allocations)
              return (
                <div key={res.id} style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', padding: '22px 26px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                          {res.hotel_name || res.hotel?.name || 'Hotel Name'}
                        </h3>
                        <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <StatusIcon style={{ width: 12, height: 12 }} />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin style={{ width: 13, height: 13 }} />
                        {[res.hotel_city || res.hotel?.city, res.hotel_district || res.hotel?.district].filter(Boolean).join(', ') || 'Northern Cyprus'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>Booking ID</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>#{res.id}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Check-in</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{fmt(res.check_in_date || res.checkin_date || res.check_in)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Check-out</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{fmt(res.check_out_date || res.checkout_date || res.check_out)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Room</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{res.room_type || res.room?.room_type || 'Standard'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>{res.total_price || res.amount ? `EUR ${Number(res.total_price || res.amount).toFixed(0)}` : '—'}</div>
                    </div>
                  </div>

                  {allocations.length > 0 && (
                    <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Room allocations</div>
                      {allocations.map((allocation, index) => (
                        <div key={`${res.id}-allocation-${index}`} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.5 }}>
                          <strong style={{ color: 'var(--text)' }}>Room {index + 1}:</strong> {allocation.adults || 0} adult{(allocation.adults || 0) !== 1 ? 's' : ''}
                          {allocation.children ? `, ${allocation.children} child${allocation.children !== 1 ? 'ren' : ''}` : ''}
                          {' · '}
                          {allocation.room_type || allocation.room?.room_type || 'Room'}
                        </div>
                      ))}
                    </div>
                  )}

                  {status !== 'cancelled' ? (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => {
                          const hotelPath = getHotelDetailPath({ id: res.hotel_id || res.hotel?.id }, location.search)
                          if (hotelPath) navigate(hotelPath)
                        }}
                        style={{ padding: '9px 20px', border: '1.5px solid var(--border)', borderRadius: 9, background: 'var(--white)', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text)' }}
                      >
                        View Hotel
                      </button>
                      <button
                        onClick={() => handleCancel(res.id)}
                        disabled={cancelling === res.id}
                        style={{ padding: '9px 20px', border: '1.5px solid var(--red)', borderRadius: 9, background: 'var(--white)', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--red)', opacity: cancelling === res.id ? 0.6 : 1 }}
                      >
                        {cancelling === res.id ? 'Cancelling...' : 'Cancel Reservation'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => {
                          const hotelPath = getHotelDetailPath({ id: res.hotel_id || res.hotel?.id }, location.search)
                          if (hotelPath) navigate(hotelPath)
                        }}
                        style={{ padding: '9px 20px', border: '1.5px solid var(--border)', borderRadius: 9, background: 'var(--white)', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text)' }}
                      >
                        View Hotel
                      </button>
                      <button
                        onClick={() => handleRemove(res.id)}
                        disabled={cancelling === res.id}
                        style={{ padding: '9px 20px', border: '1.5px solid var(--red)', borderRadius: 9, background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--red)', opacity: cancelling === res.id ? 0.6 : 1 }}
                      >
                        {cancelling === res.id ? 'Removing...' : 'Remove from list'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
