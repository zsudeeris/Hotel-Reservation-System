import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Heart, ArrowRight } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext.jsx'
import { getHotelDetailPath, getHotelName } from '../utils/hotelRouting.js'

export default function SearchHotelCard({ hotel }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggle, isFavorite } = useWishlist()
  const hotelPath = getHotelDetailPath(hotel, location.search)
  const fav = isFavorite(hotel.id)
  const score = parseFloat(hotel.score || 0)
  const scoreClass = score >= 9 ? 'exc' : ''
  const scoreLabel = score >= 9 ? 'Exceptional' : score >= 8 ? 'Excellent' : score >= 7 ? 'Very Good' : 'Good'
  const tags = hotel.amenities
    ? (Array.isArray(hotel.amenities) ? hotel.amenities : hotel.amenities.split(',').map(a => a.trim())).slice(0, 4)
    : []

  return (
    <div className="r-card" onClick={() => { if (hotelPath) navigate(hotelPath) }}>
      <div className="r-card-media">
        <img
          className="r-card-img"
          src={hotel.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'}
          alt={getHotelName(hotel)}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80' }}
        />
        <button
          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
          onClick={e => { e.stopPropagation(); toggle(hotel) }}
        >
          <Heart style={{ width: 14, height: 14, fill: fav ? '#dc2626' : 'none', stroke: fav ? '#dc2626' : '#666' }} />
        </button>
      </div>
      <div className="r-card-body">
        <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 4 }}>{'★'.repeat(Math.min(5, hotel.stars || 5))}</div>
        <div className="r-card-name">{getHotelName(hotel)}</div>
        <div className="r-card-dist">
          <MapPin style={{ width: 11, height: 11 }} />
          {hotel.city}{hotel.district ? `, ${hotel.district}` : ''}
        </div>
        <div className="r-card-tags">
          {tags.map((tag, i) => <span key={i} className="r-card-tag">{tag}</span>)}
        </div>
        <button className="r-card-link">
          View details <ArrowRight style={{ width: 13, height: 13 }} />
        </button>
      </div>
      <div className="r-card-right">
        {hotel.score && (
          <>
            <div className={`r-score ${scoreClass}`}>{score.toFixed(1)}</div>
            <div className={`r-score-lbl ${scoreClass}`}>{scoreLabel}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{hotel.review_count || 0} reviews</div>
          </>
        )}
        <div className="r-price" style={{ marginTop: 'auto' }}>
          EUR {parseFloat(hotel.price_from || 0).toFixed(0)}
        </div>
        <div className="r-price-night">/ night</div>
      </div>
    </div>
  )
}
