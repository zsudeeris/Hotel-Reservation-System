import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Heart, MapPin, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { getHotelDetailPath, getHotelName } from '../utils/hotelRouting.js'

export default function WishlistPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { favorites, remove } = useWishlist()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Heart style={{ width: 28, height: 28, fill: 'var(--red)', stroke: 'var(--red)' }} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Wishlist</h1>
            <p style={{ color: 'var(--sub)', fontSize: 13, margin: '4px 0 0' }}>{favorites.length} saved {favorites.length === 1 ? 'hotel' : 'hotels'}</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--white)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <Heart style={{ width: 56, height: 56, stroke: 'var(--border)', marginBottom: 20 }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No saved hotels yet</h3>
            <p style={{ color: 'var(--sub)', marginBottom: 24 }}>Start exploring and save your favorite hotels here</p>
            <button className="btn-view-rooms" onClick={() => navigate('/home')}>Browse Hotels</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {favorites.map(hotel => (
              <div
                key={hotel.id}
                style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer', transition: 'box-shadow .2s' }}
                onClick={() => {
                  const hotelPath = getHotelDetailPath(hotel, location.search)
                  if (hotelPath) navigate(hotelPath)
                }}
              >
                <img
                  src={hotel.image_url || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&q=80'}
                  alt={getHotelName(hotel)}
                  style={{ width: 200, height: 140, objectFit: 'cover', flexShrink: 0 }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&q=80' }}
                />
                <div style={{ flex: 1, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 4 }}>{'★'.repeat(hotel.stars || 5)}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{getHotelName(hotel)}</h3>
                    <div style={{ fontSize: 12, color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin style={{ width: 12, height: 12 }} />
                      {hotel.city}, Northern Cyprus
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--sub)' }}>From</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>${hotel.price_per_night || hotel.min_price || 99}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>per night</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); remove(hotel.id) }}
                      style={{ background: 'var(--red-light)', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
