'use client'

import { useEffect, useState } from 'react'
import { getCustomer } from '@lib/data/customer'
import ProfileDropdown from '../profile-dropdown'

export default function ProfileButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const checkCustomer = async () => {
      setIsLoading(true)
      
      try {
        // Create an AbortController for timeout management
        const controller = new AbortController();
        const signal = controller.signal;
        
        // Set a timeout to abort the request if it takes too long
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // Use Promise.race to add timeout protection
        const customer = await Promise.race([
          getCustomer(),
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Customer fetch timeout'));
            }, 4000);
          })
        ]);
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        setIsLoggedIn(!!customer)
      } catch (error) {
        console.warn('Error checking customer login status:', error instanceof Error ? error.message : 'Unknown error');
        // Default to not logged in on error
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkCustomer()
  }, [])
  
  // If still loading, render the dropdown in a neutral state
  return <ProfileDropdown loggedIn={isLoggedIn} isLoading={isLoading} />
}
