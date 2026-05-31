const CITY_FILTERS = [
  { label: 'All', value: 'all', aliases: [] },
  { label: 'Kyrenia', value: 'kyrenia', aliases: ['kyrenia', 'girne'] },
  { label: 'Nicosia', value: 'nicosia', aliases: ['nicosia', 'lefkosa', 'lefkoşa'] },
  { label: 'Famagusta', value: 'famagusta', aliases: ['famagusta', 'gazimagusa', 'gazimağusa'] },
  { label: 'Iskele', value: 'iskele', aliases: ['iskele', 'iskele', 'iskele'] },
  { label: 'Paphos / Baf', value: 'paphos', aliases: ['paphos', 'baf'] },
  { label: 'Larnaca', value: 'larnaca', aliases: ['larnaca'] },
  { label: 'Limassol', value: 'limassol', aliases: ['limassol'] },
]

const AMENITY_FILTERS = [
  { label: 'Swimming Pool', value: 'pool', aliases: ['pool', 'swimming pool'] },
  { label: 'Beachfront', value: 'beach', aliases: ['beach', 'beachfront', 'private beach', 'sandy beach', 'beach access'] },
  { label: 'Spa & Wellness', value: 'spa', aliases: ['spa', 'spa and wellness', 'wellness'] },
  { label: 'Casino Resort', value: 'casino', aliases: ['casino', 'casino resort'] },
  { label: 'Restaurant', value: 'restaurant', aliases: ['restaurant', 'dining'] },
  { label: 'Gym', value: 'gym', aliases: ['gym', 'fitness'] },
  { label: 'WiFi', value: 'wifi', aliases: ['wifi', 'wi fi', 'wi-fi', 'free wifi'] },
  { label: 'Bar', value: 'bar', aliases: ['bar', 'lounge bar'] },
  { label: 'Parking', value: 'parking', aliases: ['parking', 'car park', 'car parking'] },
]

function sanitizePriceInput(value) {
  const raw = String(value ?? '')
  if (!raw) return ''
  const cleaned = raw.replace(/[^\d.]/g, '')
  const [head, ...rest] = cleaned.split('.')
  if (head === '' && rest.length === 0) return ''
  return rest.length > 0 ? `${head}.${rest.join('')}` : head
}

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function compactText(value) {
  return normalizeText(value).replace(/\s+/g, '')
}

function matchesAnyAlias(text, aliases) {
  const hay = normalizeText(text)
  const hayCompact = compactText(text)

  return aliases.some(alias => {
    const needle = normalizeText(alias)
    if (!needle) return false
    return hay.includes(needle) || hayCompact.includes(compactText(alias))
  })
}

function getHotelCityText(hotel) {
  return [hotel?.city, hotel?.district].filter(Boolean).join(' ')
}

function parseAmenityList(amenities) {
  if (Array.isArray(amenities)) {
    return amenities.map(a => String(a).trim()).filter(Boolean)
  }

  if (typeof amenities !== 'string') return []

  const trimmed = amenities.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.map(a => String(a).trim()).filter(Boolean)
      }
    } catch {
      // Fall back to comma-separated parsing.
    }
  }

  return trimmed.split(',').map(a => a.trim()).filter(Boolean)
}

function parseNumericValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return NaN

  const trimmed = value.trim()
  if (!trimmed) return NaN

  const direct = Number(trimmed)
  if (Number.isFinite(direct)) return direct

  const match = trimmed.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : NaN
}

function getHotelPriceValue(hotel) {
  const candidates = [
    hotel?.price_from,
    hotel?.price_per_night,
    hotel?.min_price,
    hotel?.price,
  ]

  for (const candidate of candidates) {
    const parsed = parseNumericValue(candidate)
    if (Number.isFinite(parsed)) return parsed
  }

  if (Array.isArray(hotel?.rooms) && hotel.rooms.length > 0) {
    const roomPrices = hotel.rooms
      .map(room => parseNumericValue(room?.price_per_night ?? room?.price))
      .filter(Number.isFinite)
    if (roomPrices.length > 0) return Math.min(...roomPrices)
  }

  return NaN
}

function getCityOption(value) {
  return CITY_FILTERS.find(option => option.value === value)
}

function getAmenityOption(value) {
  return AMENITY_FILTERS.find(option => option.value === value)
}

function hotelMatchesCityFilter(hotel, cityValue) {
  if (!cityValue || cityValue === 'all') return true
  const option = getCityOption(cityValue)
  if (!option) return true
  return matchesAnyAlias(getHotelCityText(hotel), option.aliases)
}

function hotelMatchesAmenitiesFilter(hotel, selectedAmenities) {
  if (!selectedAmenities || selectedAmenities.length === 0) return true

  const hotelAmenities = parseAmenityList(hotel?.amenities)
  return selectedAmenities.every(selected => {
    const option = getAmenityOption(selected)
    if (!option) return true
    return hotelAmenities.some(item => matchesAnyAlias(item, option.aliases))
  })
}

export {
  AMENITY_FILTERS,
  CITY_FILTERS,
  getHotelPriceValue,
  hotelMatchesAmenitiesFilter,
  hotelMatchesCityFilter,
  normalizeText,
  parseAmenityList,
  parseNumericValue,
  sanitizePriceInput,
}
