'use client'

import React, { useState } from 'react'
import CookieConsent from 'react-cookie-consent'
import { toast } from 'sonner'

const CookieConsentBanner = () => {
  const [isDeclined, setIsDeclined] = useState(false)

  const handleDecline = () => {
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=')
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })

    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()

    // Set a flag to prevent new cookies
    localStorage.setItem('cookiesDeclined', 'true')
    
    setIsDeclined(true)
    
    // Show feedback to user
    toast.error('Cookies have been disabled. Some features may not work properly.')
  }

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    toast.success('Cookies have been enabled. Thank you for accepting.')
  }

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      declineButtonText="Decline"
      enableDeclineButton
      onDecline={handleDecline}
      onAccept={handleAccept}
      style={{
        background: '#2B373B',
        padding: '16px',
        alignItems: 'center',
        zIndex: 9999,
      }}
      buttonStyle={{
        background: '#4CAF50',
        color: 'white',
        fontSize: '14px',
        padding: '8px 16px',
      }}
      declineButtonStyle={{
        background: '#f44336',
        color: 'white',
        fontSize: '14px',
        padding: '8px 16px',
      }}
    >
      This website uses cookies to enhance your experience. By continuing to use this site, you agree to our use of cookies.
    </CookieConsent>
  )
}

export default CookieConsentBanner 