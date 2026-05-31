const RETURN_TO_KEY = 'bookhotel:returnTo'

function isSafeReturnTo(path) {
  return typeof path === 'string'
    && path.startsWith('/')
    && !path.startsWith('//')
    && !path.startsWith('/login')
    && !path.startsWith('/register')
    && !path.startsWith('/2fa')
}

export function getStoredReturnTo() {
  if (typeof window === 'undefined') return null
  const value = window.sessionStorage.getItem(RETURN_TO_KEY)
  return isSafeReturnTo(value) ? value : null
}

export function setStoredReturnTo(path) {
  if (typeof window === 'undefined') return
  if (isSafeReturnTo(path)) window.sessionStorage.setItem(RETURN_TO_KEY, path)
}

export function clearStoredReturnTo() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(RETURN_TO_KEY)
}

export function resolveReturnTo(fallback = '/home') {
  return getStoredReturnTo() || fallback
}
