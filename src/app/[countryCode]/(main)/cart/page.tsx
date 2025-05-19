import { Metadata } from 'next'

import { enrichLineItems, retrieveCart, getOrSetCart } from '@lib/data/cart'
import { getRegion } from '@lib/data/regions'
import CartTemplate from '@modules/cart/templates'
import { Container } from '@modules/common/components/container'
import { HttpTypes } from '@medusajs/types'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'View your cart',
}

const fetchCart = async (countryCode: string) => {
  // Use the country code from URL params
  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    return null
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cart
}

export default async function Cart(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const cart = await fetchCart(countryCode)
  
  // Use the country code from URL params
  const region = await getRegion(countryCode)

  return (
    <Container className="max-w-full bg-secondary !p-0">
      <CartTemplate cart={cart} />
    </Container>
  )
}