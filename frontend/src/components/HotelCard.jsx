import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext.jsx'
import { getHotelDetailPath, getHotelName } from '../utils/hotelRouting.js'

export default function HotelCard({ hotel }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggle, isFavorite } = useWishlist()
  const hotelPath = getHotelDetailPath(hotel, location.search)
  const fav = isFavorite(hotel.id)
  const score = parseFloat(hotel.score || 0)
  const scoreClass = score >= 9 ? 'ok' : (score >= 8 ? 'good' : '')
  const scoreLabel = score >= 9 ? 'Exceptional' : score >= 8 ? 'Excellent' : score >= 7 ? 'Very Good' : 'Good'

  return (
    <div className="h-card" onClick={() => { if (hotelPath) navigate(hotelPath) }}>
      <div style={{ position: 'relative' }}>
        <img
          className="h-card-img"
          src={hotel.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'}
          alt={getHotelName(hotel)}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80' }}
        />
        <button
          style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
          onClick={e => { e.stopPropagation(); toggle(hotel) }}
        >
          <Heart style={{ width: 14, height: 14, fill: fav ? '#dc2626' : 'none', stroke: fav ? '#dc2626' : '#666' }} />
        </button>
      </div>
      <div className="h-card-body">
        <div className="h-card-stars">{'★'.repeat(Math.min(5, hotel.stars || 5))}</div>
        <div className="h-card-name">{getHotelName(hotel)}</div>
        <div className="h-card-loc">
          <MapPin style={{ width: 11, height: 11 }} />
          {hotel.city}{hotel.district ? `, ${hotel.district}` : ''}
        </div>
        <div className="h-card-bottom">
          {hotel.score && (
            <>
              <div className={`h-score ${scoreClass}`}>{score.toFixed(1)}</div>
              <div className="h-score-info">
                <span className={`h-score-label ${scoreClass}`}>{scoreLabel}</span>
                <span className="h-score-rev">{hotel.review_count || 0} reviews</span>
              </div>
            </>
          )}
          <div className="h-card-price" style={{ marginLeft: 'auto' }}>
            <span>From</span>
            <strong>EUR {parseFloat(hotel.price_from || 0).toFixed(0)}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
