'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { UserIcon } from '@modules/common/icons'

interface ProfileDropdownProps {
  loggedIn: boolean
  isLoading?: boolean
}

const ProfileDropdown = ({ loggedIn, isLoading = false }: ProfileDropdownProps) => {
  const { countryCode } = useParams()
  
  // Determine where to link based on login status
  // When loading, default to the account page
  const linkHref = isLoading ? "/account" : (loggedIn ? "/account" : "/account?mode=sign-in")

  return (
    <Box className="z-50 h-full">
      <LocalizedClientLink href={linkHref} data-testid="profile-dropdown-button">
        <Box className={`rounded-full bg-transparent !p-2 text-white hover:bg-black/20 hover:text-white active:bg-black/30 active:text-white xsmall:!p-3.5 ${isLoading ? 'opacity-75' : ''}`}>
          <UserIcon />
        </Box>
      </LocalizedClientLink>
    </Box>
  )
}

export default ProfileDropdown
