export function getNights(checkin, checkout) {
  if (!checkin || !checkout || checkout <= checkin) return 0
  return Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)))
}

export function buildRoomPlansFromTotals(roomCount = 1, totalAdults = 2, totalChildren = 0) {
  const rooms = Math.max(1, parseInt(roomCount, 10) || 1)
  let adults = Math.max(rooms, parseInt(totalAdults, 10) || rooms)
  let children = Math.max(0, parseInt(totalChildren, 10) || 0)
  const plans = Array.from({ length: rooms }, () => ({ adults: 1, children: 0 }))

  let remainingAdults = adults - rooms
  let idx = 0
  while (remainingAdults > 0) {
    plans[idx % rooms].adults += 1
    idx += 1
    remainingAdults -= 1
  }

  idx = 0
  while (children > 0) {
    plans[idx % rooms].children += 1
    idx += 1
    children -= 1
  }

  return plans
}

export function getRoomGuestCount(roomPlan) {
  const adults = Math.max(1, parseInt(roomPlan?.adults, 10) || 1)
  const children = Math.max(0, parseInt(roomPlan?.children, 10) || 0)
  return adults + children
}

export function getRoomCapacity(room) {
  const capacity = parseInt(room?.capacity ?? room?.max_guests, 10)
  return Number.isFinite(capacity) && capacity > 0 ? capacity : 0
}

export function getRoomNightlyPrice(room) {
  const value = Number(room?.price_per_night ?? room?.price ?? 0)
  return Number.isFinite(value) ? value : 0
}

export function filterRoomsByCapacity(rooms, guestCount) {
  const guests = Math.max(1, parseInt(guestCount, 10) || 1)
  const list = Array.isArray(rooms) ? rooms : []
  return list
    .filter(room => getRoomCapacity(room) >= guests)
    .sort((a, b) => {
      const capDiff = getRoomCapacity(a) - getRoomCapacity(b)
      if (capDiff !== 0) return capDiff
      const priceDiff = getRoomNightlyPrice(a) - getRoomNightlyPrice(b)
      if (priceDiff !== 0) return priceDiff
      return String(a?.room_type || a?.name || '').localeCompare(String(b?.room_type || b?.name || ''))
    })
}

export function buildRoomSelection(room, roomPlan, index) {
  if (!room) {
    return {
      index,
      roomId: null,
      room: null,
      roomType: null,
      capacity: 0,
      pricePerNight: 0,
      adults: Math.max(1, parseInt(roomPlan?.adults, 10) || 1),
      children: Math.max(0, parseInt(roomPlan?.children, 10) || 0),
      guests: getRoomGuestCount(roomPlan),
    }
  }

  return {
    index,
    roomId: room.id ?? null,
    room: {
      ...room,
      capacity: getRoomCapacity(room),
      price_per_night: getRoomNightlyPrice(room),
    },
    roomType: room.room_type || room.name || null,
    capacity: getRoomCapacity(room),
    pricePerNight: getRoomNightlyPrice(room),
    adults: Math.max(1, parseInt(roomPlan?.adults, 10) || 1),
    children: Math.max(0, parseInt(roomPlan?.children, 10) || 0),
    guests: getRoomGuestCount(roomPlan),
  }
}

export function normalizeRoomSelections(roomSelections, roomPlans, rooms) {
  const plans = normalizeRoomPlans(roomPlans)
  const list = Array.isArray(roomSelections) ? roomSelections : []

  return plans.map((plan, index) => {
    const requiredGuests = getRoomGuestCount(plan)
    const eligibleRooms = filterRoomsByCapacity(rooms, requiredGuests)
    const existing = list[index] || {}
    const existingId = existing?.roomId ?? existing?.room?.id ?? existing?.id ?? null
    const matched = eligibleRooms.find(room => String(room.id) === String(existingId))

    if (matched) {
      return buildRoomSelection(matched, plan, index)
    }

    if (existing?.room && getRoomCapacity(existing.room) >= requiredGuests) {
      return buildRoomSelection(existing.room, plan, index)
    }

    return buildRoomSelection(eligibleRooms[0] || null, plan, index)
  })
}

export function roomSelectionTotals(roomSelections, nights, taxRate = 0.1) {
  const selections = Array.isArray(roomSelections) ? roomSelections.filter(selection => selection && selection.room) : []
  const stayNights = Math.max(1, parseInt(nights, 10) || 1)
  const roomTotal = selections.reduce((sum, selection) => sum + (getRoomNightlyPrice(selection.room) * stayNights), 0)
  const taxes = Math.round(roomTotal * taxRate)
  return {
    roomCount: selections.length,
    roomTotal,
    taxes,
    grandTotal: roomTotal + taxes,
    selections,
  }
}

export function normalizeRoomPlans(roomPlans, fallback = { roomCount: 1, totalAdults: 2, totalChildren: 0 }) {
  const list = Array.isArray(roomPlans) && roomPlans.length
    ? roomPlans.map(room => ({
        adults: Math.max(1, parseInt(room?.adults, 10) || 1),
        children: Math.max(0, parseInt(room?.children, 10) || 0),
      }))
    : buildRoomPlansFromTotals(fallback.roomCount, fallback.totalAdults, fallback.totalChildren)

  return list.length ? list : buildRoomPlansFromTotals(1, 2, 0)
}

export function roomPlanTotals(roomPlans) {
  const plans = normalizeRoomPlans(roomPlans)
  const totalAdults = plans.reduce((sum, room) => sum + room.adults, 0)
  const totalChildren = plans.reduce((sum, room) => sum + room.children, 0)
  return {
    roomCount: plans.length,
    totalAdults,
    totalChildren,
    totalGuests: totalAdults + totalChildren,
  }
}

export function computeBookingTotals(pricePerNight, nights, roomCount, taxRate = 0.1) {
  const nightly = Number(pricePerNight) || 0
  const count = Math.max(1, parseInt(roomCount, 10) || 1)
  const stayNights = Math.max(1, parseInt(nights, 10) || 1)
  const roomTotal = nightly * stayNights * count
  const taxes = Math.round(roomTotal * taxRate)
  return {
    roomTotal,
    taxes,
    grandTotal: roomTotal + taxes,
  }
}
