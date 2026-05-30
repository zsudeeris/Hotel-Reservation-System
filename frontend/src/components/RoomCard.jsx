import React from 'react'
import { Users, Maximize } from 'lucide-react'

export default function RoomCard({ room, onBook, nights = 1 }) {
  const price = room.price_per_night || room.price || 0
  const total = price * (nights || 1)

  return (
    <div className="room-row">
      <img
        className="room-row-img"
        src={room.image_url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'}
        alt={room.room_type || room.name}
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80' }}
      />
      <div className="room-row-body">
        <div className="room-row-name">{room.room_type || room.name}</div>
        <div className="room-row-tag">
          <Users style={{ width: 13, height: 13 }} />
          Up to {room.capacity || room.max_guests || 2} guests
          {room.size && (
            <>
              <Maximize style={{ width: 13, height: 13, marginLeft: 8 }} />
              {room.size} m²
            </>
          )}
        </div>
        {room.amenities && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            {(Array.isArray(room.amenities) ? room.amenities : room.amenities.split(',').map(a => a.trim())).slice(0, 4).join(' · ')}
          </div>
        )}
        {room.description && (
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 6 }}>{room.description}</div>
        )}
      </div>
      <div className="room-row-right">
        <div className="room-nights-lbl">{nights > 1 ? `${nights} nights` : '1 night'}</div>
        <div className="room-price-main">${total}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>${price}/night</div>
        <button className="btn-book-now" onClick={() => onBook(room)}>
          Book Now
        </button>
      </div>
    </div>
  )
}
