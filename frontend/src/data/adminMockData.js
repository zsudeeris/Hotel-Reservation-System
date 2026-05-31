const CITY_POOL = ['Iskele', 'Famagusta', 'Kyrenia', 'Nicosia', 'Bafra', 'Gazimağusa']
const HOTEL_NAMES = [
  'The Arkin Iskele Hotel',
  'Cratos Premium Hotel',
  'Kaya Artemis Resort',
  'Salamis Bay Conti',
  'Arkin Colony Hotel Famagusta',
  'Kempinski Hotel The Dome',
  'Merit Royal Premium Hotel',
  'Elexus Hotel Resort',
  'Acapulco Resort Hotel',
  'Lord’s Palace Hotel',
  'Rocks Hotel',
  'Chamada Prestige Hotel',
  'Noah’s Ark Deluxe Hotel',
  'Grand Pasha Nicosia',
  'Ramada Plaza Nicosia',
  'Merit Lefkosa Hotel',
  'Pia Bella Hotel',
  'Gillham Vineyard Hotel',
]

const MANAGER_POOL = [
  'Manager Demo',
  'Aylin Kaya',
  'Mehmet Demir',
  'Sude Eriş',
  'Kerem Arda',
  'Elif Aydın',
  'Nora Green',
  'James Carter',
  'Liam Smith',
  'Selin Yılmaz',
  'Ayla Kaya',
  'Lucas Martin',
]

const USER_NAMES = [
  ['Emma Wilson', 'emma.wilson@example.com'],
  ['Olivia Brown', 'olivia.brown@example.com'],
  ['Sude Eriş', 'sude.eris@example.com'],
  ['James Carter', 'james.carter@example.com'],
  ['Ayla Kaya', 'ayla.kaya@example.com'],
  ['Liam Smith', 'liam.smith@example.com'],
  ['Nora Green', 'nora.green@example.com'],
  ['Daniel White', 'daniel.white@example.com'],
  ['Selin Yılmaz', 'selin.yilmaz@example.com'],
  ['Mia Johnson', 'mia.johnson@example.com'],
  ['Kerem Arda', 'kerem.arda@example.com'],
  ['Elif Aydın', 'elif.aydin@example.com'],
  ['Noah Taylor', 'noah.taylor@example.com'],
  ['Lucas Martin', 'lucas.martin@example.com'],
  ['Merve Öz', 'merve.oz@example.com'],
  ['Deniz Korkmaz', 'deniz.korkmaz@example.com'],
  ['Ece Şahin', 'ece.sahin@example.com'],
  ['Can Yıldız', 'can.yildiz@example.com'],
]

const ROOM_TYPES = ['Standard Room', 'Deluxe Room', 'Deluxe Sea View Room', 'Family Suite']
const RES_STATUS = ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED', 'CHECKED-IN']
const HOTEL_STATUS = ['Active', 'Pending', 'Inactive']
const USER_STATUS = ['Active', 'Suspended']
const STAFF_STATUS = ['Active', 'Pending', 'Suspended']
const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 108200 },
  { month: 'Feb', revenue: 112500 },
  { month: 'Mar', revenue: 118900 },
  { month: 'Apr', revenue: 121300 },
  { month: 'May', revenue: 126700 },
  { month: 'Jun', revenue: 128450 },
]

const DEFAULT_SETTINGS = {
  platformName: 'BookHotel',
  supportEmail: 'support@bookhotel.com',
  cancellationPolicy: 'Free cancellation until 48 hours before check-in.',
  maintenanceMode: false,
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

function dateStr(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

function money(value) {
  return `EUR ${Number(value).toLocaleString()}`
}

function createHotels() {
  return HOTEL_NAMES.map((name, index) => {
    const city = CITY_POOL[index % CITY_POOL.length]
    const status = HOTEL_STATUS[index % HOTEL_STATUS.length]
    const rating = Number((8.2 + (index % 8) * 0.2).toFixed(1))
    return {
      id: 300 + index,
      name,
      city,
      rating,
      rooms_count: 42 + (index % 9),
      assigned_manager: MANAGER_POOL[index % MANAGER_POOL.length],
      status,
      monthly_revenue: 70200 + index * 2150,
      price_per_night: 180 + index * 14,
      description: `${name} is a premium demo property in ${city}.`,
    }
  })
}

function createUsers() {
  return USER_NAMES.map(([name, email], index) => ({
    id: 9000 + index,
    name,
    email,
    reservations_count: 1 + (index % 6),
    status: USER_STATUS[index % USER_STATUS.length],
    joined_at: dateStr(2026, (index % 6) + 1, 3 + index),
  }))
}

function createStaff(hotels) {
  return [
    { id: 1, name: 'Admin Demo', email: 'admin@bookhotel.com', role: 'Administrator', assigned_hotel: 'All Hotels', status: 'Active' },
    ...MANAGER_POOL.map((name, index) => ({
      id: 4100 + index,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@bookhotel.com`,
      role: 'Hotel Manager',
      assigned_hotel: hotels[index % hotels.length].name,
      status: STAFF_STATUS[index % STAFF_STATUS.length],
    })),
  ]
}

function createReservations(hotels) {
  return Array.from({ length: 24 }, (_, index) => {
    const hotel = hotels[index % hotels.length]
    const status = RES_STATUS[index % RES_STATUS.length]
    const room = ROOM_TYPES[index % ROOM_TYPES.length]
    const day = 12 + index
    return {
      id: 7000 + index,
      booking_id: `BK-AD-${String(7000 + index).slice(-4)}`,
      hotel_id: hotel.id,
      hotel_name: hotel.name,
      guest_name: USER_NAMES[index % USER_NAMES.length][0],
      check_in_date: dateStr(2026, 6 + (index % 2), day),
      check_out_date: dateStr(2026, 6 + (index % 2), day + 3),
      room_type: room,
      guests: 2 + (index % 3),
      status,
      total_price: 820 + index * 75,
      special_requests: index % 4 === 0 ? 'High floor preferred.' : '',
    }
  })
}

function createActivities(hotels) {
  return [
    { id: 1, text: 'New hotel onboarding completed for ' + hotels[2].name, time: '10 min ago' },
    { id: 2, text: 'Manager assigned to ' + hotels[4].name, time: '25 min ago' },
    { id: 3, text: '3 staff accounts reviewed', time: '1 hour ago' },
    { id: 4, text: 'Monthly reservation sync finished', time: '2 hours ago' },
    { id: 5, text: 'Revenue report refreshed', time: 'Today' },
  ]
}

export function createAdminMockData() {
  const hotels = createHotels()
  const users = createUsers()
  const staff = createStaff(hotels)
  const reservations = createReservations(hotels)

  const stats = {
    totalHotels: 18,
    totalUsers: 1240,
    totalReservations: 342,
    monthlyRevenue: 128450,
    activeManagers: 12,
    pendingStaffRequests: 3,
    averageOccupancy: 76,
    cancellationRate: 8,
    averageRating: 9.1,
    newUsersThisMonth: 42,
    topCity: 'Iskele',
    topHotel: 'The Arkin Iskele Hotel',
  }

  const analytics = {
    monthlyRevenue: MONTHLY_REVENUE,
    reservationsByStatus: [
      { label: 'CONFIRMED', value: 182 },
      { label: 'PENDING', value: 54 },
      { label: 'CHECKED-IN', value: 42 },
      { label: 'COMPLETED', value: 39 },
      { label: 'CANCELLED', value: 25 },
    ],
    topHotels: hotels.slice(0, 5).map((hotel, index) => ({
      label: hotel.name,
      value: 18 - index,
      revenue: 15400 - index * 920,
    })),
    mostBookedCities: CITY_POOL.map((city, index) => ({
      label: city,
      value: 14 - index * 2,
    })),
  }

  return {
    stats,
    hotels,
    users,
    staff,
    reservations,
    analytics,
    activities: createActivities(hotels),
    settings: { ...DEFAULT_SETTINGS },
  }
}

export function getAdminStatusLabel(status) {
  const normalized = String(status || '').toLowerCase().replace(/\s+/g, '-').replace(/_+/g, '-')
  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    suspended: 'Suspended',
    confirmed: 'CONFIRMED',
    cancelled: 'CANCELLED',
    completed: 'COMPLETED',
    'checked-in': 'CHECKED-IN',
    checkedin: 'CHECKED-IN',
  }
  return labels[normalized] || String(status || '').toUpperCase()
}

export { money as formatAdminMoney }
