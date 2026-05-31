export function getHotelId(hotel) {
  const raw = hotel?.id ?? hotel?.hotel_id ?? hotel?._id
  if (raw === null || raw === undefined || raw === '') return null

  const numeric = Number(raw)
  return Number.isFinite(numeric) ? numeric : String(raw)
}

export function getHotelDetailPath(hotel, search = '') {
  const id = getHotelId(hotel)
  if (id === null) return null
  const query = typeof search === 'string' && search.trim()
    ? (search.startsWith('?') ? search : `?${search}`)
    : ''
  return `/hotels/${id}${query}`
}

export function getHotelName(hotel) {
  return hotel?.hotel_name || hotel?.name || 'Hotel name unavailable'
}
