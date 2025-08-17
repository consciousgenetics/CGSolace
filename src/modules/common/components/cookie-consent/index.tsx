'use client'

import React, { useState, useEffect } from 'react'
import CookieConsent from 'react-cookie-consent'
import { toast } from 'sonner'
import { setCookieConsent, clearAllCookies, hasUserMadeCookieChoice } from '@lib/util/cookie-consent'

const CookieConsentBanner = () => {
  const [shouldShowBanner, setShouldShowBanner] = useState(true)

  useEffect(() => {
    // Check if user has already made a choice
    if (hasUserMadeCookieChoice()) {
      setShouldShowBanner(false)
    }
  }, [])

  const handleDecline = () => {
    // Clear all existing cookies and storage
    clearAllCookies()
    
    // Set the decline preference using our cookie consent utility
    setCookieConsent(false)
    
    setShouldShowBanner(false)
    
    // Show feedback to user
    toast.error('Cookies have been disabled. Some features may not work properly.')
  }

  const handleAccept = () => {
    // Set the acceptance preference using our cookie consent utility
    setCookieConsent(true)
    
    setShouldShowBanner(false)
    
    toast.success('Cookies have been enabled. Thank you for accepting.')
  }

  // Don't render the banner if user has already made a choice
  if (!shouldShowBanner) {
    return null
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