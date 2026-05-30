import { useCallback } from 'react'

let toastFn = null

export function registerToast(fn) {
  toastFn = fn
}

export function useToast() {
  const showToast = useCallback((message, duration = 3000) => {
    if (toastFn) toastFn(message, duration)
  }, [])
  return { showToast }
}
