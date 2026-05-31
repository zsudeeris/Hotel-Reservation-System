const DEMO_GUESTS = [
  { name: 'Emma Wilson', email: 'emma.wilson@example.com' },
  { name: 'Mehmet Demir', email: 'mehmet.demir@example.com' },
  { name: 'Olivia Brown', email: 'olivia.brown@example.com' },
  { name: 'Sude Eriş', email: 'sude.eris@example.com' },
  { name: 'James Carter', email: 'james.carter@example.com' },
  { name: 'Ayla Kaya', email: 'ayla.kaya@example.com' },
  { name: 'Liam Smith', email: 'liam.smith@example.com' },
  { name: 'Nora Green', email: 'nora.green@example.com' },
  { name: 'Daniel White', email: 'daniel.white@example.com' },
  { name: 'Selin Yılmaz', email: 'selin.yilmaz@example.com' },
  { name: 'Lucas Martin', email: 'lucas.martin@example.com' },
  { name: 'Mia Johnson', email: 'mia.johnson@example.com' },
  { name: 'Kerem Arda', email: 'kerem.arda@example.com' },
  { name: 'Elif Aydın', email: 'elif.aydin@example.com' },
  { name: 'Noah Taylor', email: 'noah.taylor@example.com' },
]

const ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Deluxe Sea View Room',
  'Family Suite',
]

const STATUSES = ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED', 'CHECKED-IN']

const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 30200, bookings: 48 },
  { month: 'Feb', revenue: 31850, bookings: 51 },
  { month: 'Mar', revenue: 35620, bookings: 56 },
  { month: 'Apr', revenue: 34410, bookings: 54 },
  { month: 'May', revenue: 40190, bookings: 62 },
  { month: 'Jun', revenue: 42850, bookings: 64 },
]

const ROOM_BREAKDOWN = [
  { label: 'Deluxe Sea View Room', value: 18 },
  { label: 'Deluxe Room', value: 14 },
  { label: 'Family Suite', value: 11 },
  { label: 'Standard Room', value: 9 },
  { label: 'Executive Suite', value: 7 },
]

const STATUS_BREAKDOWN = [
  { label: 'Confirmed', value: 41 },
  { label: 'Checked-in', value: 12 },
  { label: 'Completed', value: 8 },
  { label: 'Pending', value: 7 },
  { label: 'Cancelled', value: 5 },
]

const REVIEW_SNIPPETS = [
  'Beautiful sea views and very attentive staff.',
  'Breakfast quality was excellent and check-in was smooth.',
  'Rooms were clean, spacious and quiet.',
  'Great family facilities and a relaxing pool area.',
  'We would book this hotel again for the location alone.',
]

const ROOM_IMAGE_POOLS = {
  'Standard Room': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80',
  ],
  'Deluxe Room': [
    'https://images.unsplash.com/photo-1560067174-8943bdedffb3?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
  ],
  'Deluxe Sea View Room': [
    'https://images.unsplash.com/photo-1501117716987-c8e2a1e3f2d7?w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&sat=-10',
    'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1200&q=80',
  ],
  'Family Suite': [
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80&fit=crop',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80&sat=-20',
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&q=80',
  ],
}

const MEDIA_POOL = [
  'https://images.unsplash.com/photo-1501117716987-c8e2a1e3f2d7?w=1200&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
  'https://images.unsplash.com/photo-1560067174-8943bdedffb3?w=1200&q=80',
]

function pickImage(pool, index) {
  return pool[index % pool.length]
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

function dateStr(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

function makeReservation(index, hotel) {
  const guest = DEMO_GUESTS[index % DEMO_GUESTS.length]
  const roomType = ROOM_TYPES[index % ROOM_TYPES.length]
  const status = STATUSES[index % STATUSES.length]
  const baseDay = 18 + index
  const month = index < 5 ? 6 : 7
  const checkIn = dateStr(2026, month, baseDay)
  const checkOut = dateStr(2026, month, baseDay + 3 + (index % 3))
  const total = [840, 1100, 1460, 1520, 2250, 980, 1730, 1620, 1260, 1990, 1840, 920, 2100, 1550, 2480][index % 15]
  const guests = [2, 2, 4, 3, 2, 1, 2, 3, 2, 5, 4, 2, 3, 2, 4][index % 15]
  const specialRequests = [
    'Quiet room near the elevator.',
    '',
    'Airport pickup requested at 18:30.',
    'Late check-out if available.',
    '',
    'High floor with sea view preferred.',
    '',
    'Baby cot needed.',
    '',
    'Two separate beds requested.',
    '',
    'Vegetarian breakfast arrangement.',
    '',
    'VIP welcome setup requested.',
    '',
  ][index % 15]

  return {
    id: 5800 + index,
    booking_id: `BK-2026-${String(5800 + index).slice(-4)}`,
    hotel_id: hotel.id,
    hotel_name: hotel.hotel_name,
    guest_name: guest.name,
    guest_email: guest.email,
    check_in_date: checkIn,
    check_out_date: checkOut,
    room_type: roomType,
    guests,
    status,
    total_price: total,
    room_number: 100 + index,
    special_requests: specialRequests,
    internal_note: '',
  }
}

function makeRoom(index, hotel) {
  const roomType = ROOM_TYPES[Math.floor(index / 4)]
  const roomNumber = 1801 + index
  const roomIndex = index % 4
  const roomMeta = {
    'Standard Room': { capacity: 2, price: 178.5, status: index % 6 === 0 ? 'Occupied' : 'Available' },
    'Deluxe Room': { capacity: 3, price: 231, status: index % 7 === 0 ? 'Maintenance' : 'Available' },
    'Deluxe Sea View Room': { capacity: 4, price: 304.5, status: index % 5 === 0 ? 'Occupied' : 'Available' },
    'Family Suite': { capacity: 5, price: 420, status: index % 8 === 0 ? 'Maintenance' : 'Available' },
  }[roomType]
  return {
    id: 900 + index,
    room_type: roomType,
    room_number: roomNumber,
    capacity: roomMeta.capacity,
    price_per_night: roomMeta.price,
    status: roomMeta.status,
    available: roomMeta.status === 'Available',
    description: `${roomType} with modern furnishings and premium hotel amenities.`,
    amenities: roomType === 'Family Suite'
      ? ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Family Sofa']
      : ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar'],
    img: pickImage(ROOM_IMAGE_POOLS[roomType], roomIndex),
    image_variant: roomIndex,
  }
}

function makeReview(index, hotel) {
  const reviewer = DEMO_GUESTS[index % DEMO_GUESTS.length]
  const rating = [9.6, 9.1, 8.8, 9.4, 8.9, 9.0][index % 6]
  return {
    id: 7200 + index,
    reviewer_name: reviewer.name,
    rating,
    comment: REVIEW_SNIPPETS[index % REVIEW_SNIPPETS.length],
    created_at: dateStr(2026, 6 + (index % 2), 2 + index),
    hotel_id: hotel.id,
  }
}

export function createManagerMockData(hotel = {}) {
  const resolvedHotel = {
    id: hotel.id || 18,
    hotel_name: hotel.hotel_name || 'The Arkin Iskele Hotel',
    city: hotel.city || 'Iskele',
    district: hotel.district || 'Northern Cyprus',
    description: hotel.description || 'Luxury beachfront hotel with premium amenities, spa, dining and family-friendly facilities.',
    img: hotel.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80',
  }

  const reservations = Array.from({ length: 15 }, (_, index) => makeReservation(index, resolvedHotel))
  const rooms = Array.from({ length: 16 }, (_, index) => makeRoom(index, resolvedHotel))
  const reviews = Array.from({ length: 8 }, (_, index) => makeReview(index, resolvedHotel))

  return {
    hotel: resolvedHotel,
    rooms,
    reservations,
    reviews,
    media: [resolvedHotel.img, ...MEDIA_POOL].slice(0, 8),
    stats: {
      hotel_id: resolvedHotel.id,
      hotel_name: resolvedHotel.hotel_name,
      total_reservations: 64,
      active_reservations: 18,
      total_revenue: 42850,
      total_rooms: 45,
      available_rooms: 27,
      occupancy_rate: 76,
      avg_rating: 9.1,
      today_check_ins: 4,
      today_check_outs: 2,
      most_booked_room: 'Deluxe Sea View Room',
      cancellation_rate: 8,
      guest_satisfaction: 92,
      average_daily_rate: 310,
    },
    analytics: {
      monthlyRevenue: MONTHLY_REVENUE,
      roomTypeBreakdown: ROOM_BREAKDOWN,
      statusBreakdown: STATUS_BREAKDOWN,
      occupancyTrend: [
        { month: 'Jan', value: 69 },
        { month: 'Feb', value: 71 },
        { month: 'Mar', value: 73 },
        { month: 'Apr', value: 72 },
        { month: 'May', value: 75 },
        { month: 'Jun', value: 76 },
      ],
    },
  }
}
