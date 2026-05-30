import React, { createContext, useContext, useState, useEffect } from 'react'

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
    setFavorites(prev => {
      const exists = prev.some(h => h.id === hotel.id)
      if (exists) return prev.filter(h => h.id !== hotel.id)
      return [...prev, hotel]
    })
  }

  const isFavorite = (id) => favorites.some(h => h.id === id)

  const remove = (id) => setFavorites(prev => prev.filter(h => h.id !== id))

  return (
    <WishlistContext.Provider value={{ favorites, toggle, isFavorite, remove }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
