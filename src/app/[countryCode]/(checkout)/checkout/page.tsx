import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { enrichLineItems, getOrSetCart } from '@lib/data/cart'
import { getCustomer } from '@lib/data/customer'
import { getRegion } from '@lib/data/regions'
import Wrapper from '@modules/checkout/components/payment-wrapper'
import CheckoutForm from '@modules/checkout/templates/checkout-form'
import CheckoutSummary from '@modules/checkout/templates/checkout-summary'
import { Container } from '@modules/common/components/container'
import { HttpTypes } from '@medusajs/types'

export const metadata: Metadata = {
  title: 'Checkout',
}

const fetchCart = async (countryCode: string) => {
  console.log('Checkout: Fetching cart for country:', countryCode);
  
  // Get or create cart with correct region
  const cart = await getOrSetCart(countryCode)
  if (!cart) {
    console.log('Checkout: No cart found');
    return notFound()
  }

  console.log('Checkout: Cart region:', {
    regionId: cart.region_id,
    currency: cart.region?.currency_code
  });

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id) as HttpTypes.StoreCartLineItem[]
    cart.items = enrichedItems
  }

  return cart
}

export default async function Checkout({
  params,
  searchParams,
}: {
  params: { countryCode: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { countryCode } = params
  
  // First ensure we have a valid region
  const region = await getRegion(countryCode)
  if (!region) {
    console.error('Checkout: Region not found for country code:', countryCode);
    return notFound()
  }

  console.log('Checkout: Using region:', {
    countryCode,
    regionId: region.id,
    currency: region.currency_code
  });

  const cart = await fetchCart(countryCode)
  const customer = await getCustomer()

  // Ensure searchParams is properly typed
  const step = typeof searchParams.step === 'string' ? searchParams.step : undefined

  return (
    <Container className="mx-0 grid max-w-full grid-cols-1 gap-y-4 bg-secondary large:grid-cols-[1fr_416px] large:gap-x-10 2xl:gap-x-40">
      <Wrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
        <CheckoutSummary cart={cart} searchParams={{ step }} />
      </Wrapper>
    </Container>
  )
}
