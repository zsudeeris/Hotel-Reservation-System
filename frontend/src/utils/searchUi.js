const CITY_ALIASES = [
  { value: 'Girne', label: 'Girne / Kyrenia', aliases: ['Kyrenia'] },
  { value: 'Lefkoşa', label: 'Lefkoşa / Nicosia', aliases: ['Nicosia', 'Lefkosa'] },
  { value: 'Gazimağusa', label: 'Gazimağusa / Famagusta', aliases: ['Famagusta', 'Gazimagusa'] },
  { value: 'İskele', label: 'İskele / Iskele', aliases: ['Iskele'] },
  { value: 'Güzelyurt', label: 'Güzelyurt / Morphou', aliases: ['Morphou', 'Guzelyurt'] },
  { value: 'Dipkarpaz', label: 'Dipkarpaz / Karpaz', aliases: ['Karpaz'] },
  { value: 'Bafra', label: 'Bafra', aliases: [] },
]

export function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

function addSuggestion(list, seen, item) {
  const key = normalizeSearchText(item.value || item.label)
  if (!key || seen.has(key)) return
  seen.add(key)
  list.push({
    ...item,
    normalizedValue: key,
    normalizedLabel: normalizeSearchText(item.label),
    normalizedAliases: (item.aliases || []).map(normalizeSearchText),
  })
}

export function buildDestinationSuggestions(hotels = []) {
  const list = []
  const seen = new Set()

  CITY_ALIASES.forEach(city => {
    addSuggestion(list, seen, { type: 'city', value: city.value, label: city.label, aliases: city.aliases })
  })

  for (const hotel of Array.isArray(hotels) ? hotels : []) {
    const hotelName = hotel.hotel_name || hotel.name || ''
    if (hotelName) {
      addSuggestion(list, seen, { type: 'hotel', value: hotelName, label: hotelName, aliases: [] })
    }
    const city = hotel.city || ''
    if (city) {
      const label = hotel.district ? `${city} / ${hotel.district}` : city
      addSuggestion(list, seen, { type: 'city', value: city, label, aliases: hotel.district ? [hotel.district] : [] })
    }
    const district = hotel.district || ''
    if (district) {
      addSuggestion(list, seen, { type: 'city', value: district, label: district, aliases: [] })
    }
  }

  return list
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'city' ? -1 : 1
      return a.label.localeCompare(b.label)
    })
}

export function matchDestinationSuggestions(query, suggestions, limit = 8) {
  const q = normalizeSearchText(query)
  if (!q) return []

  return [...suggestions]
    .map(item => {
      const score =
        item.normalizedValue.startsWith(q) ? 0 :
        item.normalizedLabel.startsWith(q) ? 1 :
        item.normalizedAliases.some(a => a.startsWith(q)) ? 2 :
        item.normalizedValue.includes(q) ? 3 :
        item.normalizedLabel.includes(q) ? 4 :
        item.normalizedAliases.some(a => a.includes(q)) ? 5 :
        99
      return { ...item, score }
    })
    .filter(item => item.score < 99)
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
    .slice(0, limit)
}

export function formatDateLabel(dateStr) {
  if (!dateStr) return 'Add date'
  const [y, m, d] = String(dateStr).split('-')
  return `${d}.${m}.${y}`
}

export function toIsoDate(date) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const y = local.getFullYear()
  const m = String(local.getMonth() + 1).padStart(2, '0')
  const d = String(local.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function startOfDay(date = new Date()) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
