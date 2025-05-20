import { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'

import { enrichLineItems, retrieveCart } from '@lib/data/cart'
import { getRegion } from '@lib/data/regions'
import CartTemplate from '@modules/cart/templates'
import { Container } from '@modules/common/components/container'
import { HttpTypes } from '@medusajs/types'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'View your cart',
}

// Make sure this page is dynamically rendered
export const dynamic = 'force-dynamic'

const fetchCart = async () => {
  // Mark this component as uncacheable
  noStore()
  
  try {
    // Use retrieveCart instead of getOrSetCart to avoid revalidation during render
    const cart = await retrieveCart()

    if (!cart) {
      return null
    }

    if (cart?.items?.length) {
      const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id)
      cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
    }

    return cart
  } catch (error) {
    console.error("Error fetching cart:", error)
    return null
  }
}

export default async function Cart(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const cart = await fetchCart()
  
  // Always use UK region
  const region = await getRegion('uk')

  return (
    <Container className="max-w-full bg-secondary !p-0">
      <CartTemplate cart={cart} />
    </Container>
  )
}