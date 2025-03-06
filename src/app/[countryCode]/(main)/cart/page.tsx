import { Suspense } from 'react'
import { Metadata } from 'next'

import { enrichLineItems, retrieveCart, getOrSetCart } from '@lib/data/cart'
import { getProductsList } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import CartTemplate from '@modules/cart/templates'
import { Container } from '@modules/common/components/container'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'View your cart',
}

const fetchCart = async () => {
  // Always use UK region
  const cart = await getOrSetCart('uk')

  if (!cart) {
    return null
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id)
    cart.items = enrichedItems
  }

  return cart
}

export default async function Cart(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const cart = await fetchCart()
  
  // Always use UK region
  const [region, { products }] = await Promise.all([
    getRegion('uk'),
    getProductsList({
      pageParam: 0,
      queryParams: {
        limit: 9,
      },
      countryCode: 'uk',
    }).then(({ response }) => response),
  ])

  return (
    <Container className="max-w-full bg-secondary !p-0">
      <CartTemplate cart={cart} />
      <Suspense fallback={<SkeletonProductsCarousel />}>
        <ProductCarousel
          products={products}
          title="You may also like"
          regionId={region.id}
        />
      </Suspense>
    </Container>
  )
}
