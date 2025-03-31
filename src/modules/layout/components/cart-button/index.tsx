import { retrieveCart } from '@lib/data/cart'
import { Box } from '@modules/common/components/box'
import { BagIcon } from '@modules/common/icons/bag'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export default async function CartButton() {
  // Fetch cart data
  const cart = await retrieveCart()
  
  // Calculate total items
  const totalItems = cart?.items?.reduce((acc, item) => {
    return acc + item.quantity
  }, 0) || 0
  
  return (
    <Box className="z-50 h-full">
      <LocalizedClientLink href="/cart" data-testid="nav-cart-link">
        <Box className="relative rounded-full bg-transparent !p-2 text-white hover:bg-black/20 hover:text-white active:bg-black/30 active:text-white xsmall:!p-3.5">
          <BagIcon />
          {totalItems > 0 && (
            <span 
              style={{backgroundColor: '#ef4444'}} 
              className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full !bg-red-500 text-[10px] text-white"
            >
              {`${totalItems}`}
            </span>
          )}
        </Box>
      </LocalizedClientLink>
    </Box>
  )
}