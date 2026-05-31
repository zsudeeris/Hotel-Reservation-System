import React from 'react'
import { AlertCircle, Users } from 'lucide-react'
import RoomCard from './RoomCard.jsx'
import { filterRoomsByCapacity, getRoomGuestCount } from '../utils/bookingState.js'

function roomLabel(room) {
  return room?.room_type || room?.name || 'Room'
}

export default function AvailableRooms({ rooms = [], roomsByPlan = [], roomPlans = [], roomSelections = [], selectionErrors = [], nights = 1, onSelectRoom }) {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {roomPlans.map((plan, index) => {
        const guests = getRoomGuestCount(plan)
        const planRooms = Array.isArray(roomsByPlan?.[index]) && roomsByPlan[index].length ? roomsByPlan[index] : rooms
        const eligibleRooms = filterRoomsByCapacity(planRooms, guests)
        const selectedRoom = roomSelections?.[index]?.room || null
        const roomError = selectionErrors?.[index] || ''

        return (
          <section key={`available-rooms-${index}`} style={{ display: 'grid', gap: 12 }}>
            <div className="available-room-head">
              <div>
                <div className="available-room-title">Room {index + 1} options</div>
                <div className="available-room-sub">
                  {plan.adults} adult{plan.adults !== 1 ? 's' : ''}
                  {plan.children ? `, ${plan.children} child${plan.children !== 1 ? 'ren' : ''}` : ''}
                  {' · '}
                  requires {guests}+ guests
                </div>
              </div>
              {selectedRoom && (
                <div className="available-room-selected">
                  <Users style={{ width: 13, height: 13 }} />
                  {roomLabel(selectedRoom)}
                </div>
              )}
            </div>
            {roomError && (
              <div style={{ color: 'var(--red)', fontSize: 12.5, lineHeight: 1.45, marginTop: -4 }}>
                {roomError}
              </div>
            )}

            {eligibleRooms.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {eligibleRooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    nights={nights}
                    roomCount={1}
                    selected={String(room.id) === String(selectedRoom?.id)}
                    buttonLabel={String(room.id) === String(selectedRoom?.id) ? 'Selected' : 'Select room'}
                    disabled={String(room.id) === String(selectedRoom?.id)}
                    onBook={() => onSelectRoom(index, room)}
                  />
                ))}
              </div>
            ) : (
              <div className="available-room-empty">
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                No room type fits this guest count.
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
