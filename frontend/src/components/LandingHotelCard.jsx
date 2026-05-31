import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext.jsx'
import { getHotelDetailPath, getHotelName } from '../utils/hotelRouting.js'

export default function LandingHotelCard({ hotel }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggle, isFavorite } = useWishlist()
  const hotelPath = getHotelDetailPath(hotel, location.search)
  const fav = isFavorite(hotel.id)
  const score = parseFloat(hotel.score || 0)
  const stars = '★'.repeat(Math.min(5, hotel.stars || 5))

  return (
    <div className="lh-card" onClick={() => { if (hotelPath) navigate(hotelPath) }}>
      <div className="lh-card-img-wrap">
        <img
          className="lh-card-img"
          src={hotel.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'}
          alt={getHotelName(hotel)}
          loading="lazy"
          decoding="async"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80' }}
        />
        <div className="lh-card-score">{score.toFixed(1)}</div>
        <button
          className="lh-card-fav"
          onClick={e => { e.stopPropagation(); toggle(hotel) }}
          title={fav ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart style={{ width: 16, height: 16, fill: fav ? '#dc2626' : 'none', stroke: fav ? '#dc2626' : '#666' }} />
        </button>
      </div>
      <div className="lh-card-body">
        <div className="lh-card-stars">{stars}</div>
        <div className="lh-card-name">{getHotelName(hotel)}</div>
        <div className="lh-card-loc">
          <MapPin style={{ width: 12, height: 12 }} />
          {hotel.city}{hotel.district ? `, ${hotel.district}` : ''}
        </div>
        <div className="lh-card-footer">
          <div className="lh-card-price">
            <span>{hotel.label || 'Good'}</span>
            <strong>EUR {parseFloat(hotel.price_from || 0).toFixed(0)}</strong>
          </div>
          <button className="lh-card-btn" onClick={e => { e.stopPropagation(); if (hotelPath) navigate(hotelPath) }}>
            View →
          </button>
        </div>
      </div>
    </div>
  )
}
