'use client'

import { useEffect, useState } from 'react'
import { getCustomer } from '@lib/data/customer'
import ProfileDropdown from '../profile-dropdown'

export default function ProfileButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    const checkCustomer = async () => {
      try {
        const customer = await getCustomer()
        setIsLoggedIn(!!customer)
      } catch (error) {
        setIsLoggedIn(false)
      }
    }
    
    checkCustomer()
  }, [])
  
  return <ProfileDropdown loggedIn={isLoggedIn} />
}
