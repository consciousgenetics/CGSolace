'use client'

import { Box } from '@modules/common/components/box'
import CartButton from '@modules/layout/components/cart-button'
import ProfileButton from '@modules/layout/components/profile-button'
import CurrencyDropdown from '@modules/layout/components/currency-dropdown'

export default function NavActions() {
  return (
    <Box className="flex items-center !py-4">
      <CurrencyDropdown />
      <ProfileButton />
      <CartButton />
    </Box>
  )
}
