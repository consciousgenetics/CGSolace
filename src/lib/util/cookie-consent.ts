/**
 * Cookie consent utility functions
 * Provides centralized management of cookie consent preferences
 */

// Check if cookies are accepted by the user
export function areCookiesAccepted(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: assume cookies are OK for essential functionality
    return true
  }

  // Check for explicit decline first
  const declined = document.cookie.includes('cookiesDeclined=true')
  if (declined) {
    return false
  }

  // Check for explicit acceptance
  const accepted = document.cookie.includes('cookiesAccepted=true')
  return accepted
}

// Check if user has made a choice about cookies
export function hasUserMadeCookieChoice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return document.cookie.includes('cookiesAccepted=true') || 
         document.cookie.includes('cookiesDeclined=true')
}

// Set cookie consent preference
export function setCookieConsent(accepted: boolean): void {
  if (typeof window === 'undefined') {
    return
  }

  // Clear any existing consent cookies first
  document.cookie = 'cookiesAccepted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  document.cookie = 'cookiesDeclined=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

  // Set the new preference with a long expiry (1 year)
  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + 1)
  
  if (accepted) {
    document.cookie = `cookiesAccepted=true; expires=${expiry.toUTCString()}; path=/; SameSite=Strict`
  } else {
    document.cookie = `cookiesDeclined=true; expires=${expiry.toUTCString()}; path=/; SameSite=Strict`
  }
}

// Clear all non-essential cookies when user declines
export function clearAllCookies(): void {
  if (typeof window === 'undefined') {
    return
  }

  // Get all cookies
  const cookies = document.cookie.split(';')
  
  // Essential cookies that should be preserved (only consent-related)
  const essentialCookies = ['cookiesDeclined', 'cookiesAccepted']
  
  cookies.forEach(cookie => {
    const [name] = cookie.split('=')
    const cookieName = name.trim()
    
    // Only clear non-essential cookies
    if (!essentialCookies.includes(cookieName)) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
    }
  })

  // Clear storage
  try {
    localStorage.clear()
    sessionStorage.clear()
  } catch (e) {
    // Ignore errors if storage is not available
  }
}

// Check server-side consent from request headers
export function checkServerSideCookieConsent(cookieHeader?: string): boolean {
  if (!cookieHeader) {
    return false
  }

  // Parse cookies from header
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=')
    acc[name] = value
    return acc
  }, {} as Record<string, string>)

  // Check for explicit decline first
  if (cookies.cookiesDeclined === 'true') {
    return false
  }

  // Check for explicit acceptance
  return cookies.cookiesAccepted === 'true'
}
