import React, { createContext, useContext, useState, useEffect } from 'react'
import { getHotelId } from '../utils/hotelRouting.js'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('favorites')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggle = (hotel) => {
    const hotelId = getHotelId(hotel)
    if (hotelId === null) return
    setFavorites(prev => {
      const exists = prev.some(h => getHotelId(h) === hotelId)
      if (exists) return prev.filter(h => getHotelId(h) !== hotelId)
      return [...prev, hotel]
    })
  }

  const isFavorite = (id) => {
    const normalized = getHotelId({ id })
    if (normalized === null) return false
    return favorites.some(h => getHotelId(h) === normalized)
  }

  const remove = (id) => {
    const normalized = getHotelId({ id })
    if (normalized === null) return
    setFavorites(prev => prev.filter(h => getHotelId(h) !== normalized))
  }

  return (
    <WishlistContext.Provider value={{ favorites, toggle, isFavorite, remove }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
