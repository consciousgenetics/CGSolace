'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { sdk } from '@lib/config'
import medusaError from '@lib/util/medusa-error'
import { HttpTypes } from '@medusajs/types'
import { omit } from 'lodash'

import { getAuthHeaders, getCartId, removeCartId, setCartId } from './cookies'
import { getProductByHandle, getProductsById } from './products'
import { getRegion } from './regions'

const createCart = async (data: {
  region_id: string
  country_code: string
}) => {
  try {
    const result = await sdk.store.cart.create(data);
    return result.cart;
  } catch (error) {
    console.error('createCart: Error creating cart:', error);
    return null;
  }
}

export async function retrieveCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return null
  }

  const authHeaders = await getAuthHeaders()

  return await sdk.store.cart
    .retrieve(cartId, {}, { next: { tags: ['cart'] }, ...authHeaders })
    .then(({ cart }) => cart)
    .catch(() => {
      return null
    })
}

export const getOrSetCart = async (countryCode: string = 'uk') => {
  try {
    console.log('getOrSetCart: Starting with country code:', countryCode);

    // Always get the UK region
    const region = await getRegion('uk');
    if (!region) {
      console.error('getOrSetCart: Failed to get UK region');
      return null;
    }

    console.log('getOrSetCart: Using region:', {
      id: region.id,
      currency: region.currency_code
    });

    // Get existing cart
    const existingCart = await retrieveCart();
    
    if (!existingCart) {
      console.log('getOrSetCart: No existing cart, creating new one with UK region');
      return createCart({
        region_id: region.id,
        country_code: 'gb',
      });
    }

    // Check if cart needs region update
    if (existingCart.region_id !== region.id || existingCart.region?.currency_code?.toLowerCase() !== 'gbp') {
      console.log('getOrSetCart: Updating cart region to UK/GBP:', {
        oldRegion: existingCart.region_id,
        oldCurrency: existingCart.region?.currency_code,
        newRegion: region.id
      });

      try {
        const updatedCart = await sdk.store.cart.update(existingCart.id, {
          region_id: region.id,
        });
        
        console.log('getOrSetCart: Cart updated successfully:', {
          id: updatedCart.cart.id,
          region: updatedCart.cart.region_id,
          currency: updatedCart.cart.region?.currency_code
        });
        
        return updatedCart.cart;
      } catch (error) {
        console.error('getOrSetCart: Failed to update cart region:', error);
        
        // If update fails, create a new cart
        console.log('getOrSetCart: Creating new cart with UK region');
        return createCart({
          region_id: region.id,
          country_code: 'gb',
        });
      }
    }

    console.log('getOrSetCart: Using existing cart:', {
      id: existingCart.id,
      region: existingCart.region_id,
      currency: existingCart.region?.currency_code
    });

    return existingCart;
  } catch (error) {
    console.error('getOrSetCart: Error:', error);
    return null;
  }
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('No existing cart found, please create one before updating')
  }

  const authHeaders = await getAuthHeaders()

  return sdk.store.cart
    .update(cartId, data, {}, authHeaders)
    .then(({ cart }) => {
      revalidateTag('cart')
      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    console.error('addToCart: Missing variant ID');
    throw new Error('Missing variant ID when adding to cart')
  }

  try {
    // First, ensure we have a valid region
    const region = await getRegion(countryCode)
    if (!region) {
      console.error('addToCart: Region not found for country code:', countryCode);
      throw new Error('Region not found')
    }

    // Get or create cart with the correct region
    const cart = await getOrSetCart(countryCode)
    if (!cart) {
      console.error('addToCart: Failed to get or create cart');
      throw new Error('Error retrieving or creating cart')
    }

    console.log('addToCart: Got cart:', {
      cartId: cart.id,
      regionId: cart.region_id,
      expectedRegionId: region.id
    });

    // Ensure the cart has the correct region
    if (cart.region_id !== region.id) {
      console.log('addToCart: Updating cart region');
      await updateCart({ region_id: region.id })
    }

    const authHeaders = await getAuthHeaders()

    console.log('addToCart: Adding line item:', {
      cartId: cart.id,
      variantId,
      quantity
    });

    // Add the item to cart
    await sdk.store.cart
      .createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        authHeaders
      )
      .then(() => {
        console.log('addToCart: Successfully added item to cart');
        revalidateTag('cart')
      })
      .catch((error) => {
        console.error('addToCart: Error adding line item:', error)
        throw error
      })
  } catch (error) {
    console.error('addToCart: Error in main try block:', error)
    throw error
  }
}

export async function addToCartCheapestVariant({
  productHandle,
  regionId,
  countryCode,
}: {
  productHandle: string
  regionId: string
  countryCode: string
}) {
  if (!productHandle || !regionId || !countryCode) {
    return {
      success: false,
      error: 'Missing required parameters',
    }
  }

  try {
    const detailedProduct = await getProductByHandle(productHandle, regionId)

    if (!detailedProduct) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Find the cheapest variant
    const cheapestVariant = detailedProduct.variants.reduce(
      (cheapest, current) =>
        cheapest.calculated_price.original_amount <
        current.calculated_price.original_amount
          ? cheapest
          : current
    )

    if (cheapestVariant.inventory_quantity <= 0) {
      return {
        success: false,
        error: 'Product is out of stock',
      }
    }

    await addToCart({
      variantId: cheapestVariant.id, // Add the cheapest variant to the cart
      quantity: 1,
      countryCode,
    })

    return {
      success: true,
      message: 'Product added to cart',
    }
  } catch (error) {
    console.error('Error adding product to cart:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error('Missing lineItem ID when updating line item')
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('Missing cart ID when updating line item')
  }

  const authHeaders = await getAuthHeaders()

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, authHeaders)
    .then(() => {
      revalidateTag('cart')
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error('Missing lineItem ID when deleting line item')
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('Missing cart ID when deleting line item')
  }

  const authHeaders = await getAuthHeaders()

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, authHeaders)
    .then(() => {
      revalidateTag('cart')
    })
    .catch(medusaError)

  revalidateTag('cart')
}

export async function enrichLineItems(
  lineItems:
    | HttpTypes.StoreCartLineItem[]
    | HttpTypes.StoreOrderLineItem[]
    | null,
  regionId: string
) {
  if (!lineItems) return []

  // Get the UK region to ensure we use GBP prices
  const ukRegion = await getRegion('uk')
  if (!ukRegion) {
    console.error('enrichLineItems: Failed to get UK region');
    return lineItems;
  }

  // Prepare query parameters with UK region
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.product_id!),
    regionId: ukRegion.id, // Use UK region ID to get GBP prices
  }

  // Fetch products by their IDs
  const products = await getProductsById(queryParams)
  if (!lineItems?.length || !products) {
    return []
  }

  let cartSubtotal = 0;
  let cartTotal = 0;

  // Enrich line items with product and variant information
  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p: any) => p.id === item.product_id)
    const variant = product?.variants?.find(
      (v: any) => v.id === item.variant_id
    ) as HttpTypes.StoreProductVariant & { prices?: Array<{ currency_code: string; amount: number }> }

    if (!product || !variant) {
      return item
    }

    // Find GBP price for the variant
    const gbpPrice = variant.prices?.find(p => 
      p.currency_code?.toUpperCase() === 'GBP'
    )

    // If we found a GBP price, use it to calculate totals
    if (gbpPrice && item.quantity) {
      console.log(`enrichLineItems: Using GBP price for variant ${variant.id}:`, {
        amount: gbpPrice.amount,
        quantity: item.quantity
      });

      const itemTotal = gbpPrice.amount * item.quantity;
      
      // Update item with GBP prices
      item.unit_price = gbpPrice.amount;
      item.subtotal = itemTotal;
      item.total = itemTotal;
      
      // Add to cart totals
      cartSubtotal += itemTotal;
      cartTotal += itemTotal;

      console.log('enrichLineItems: Updated line item totals:', {
        variantId: variant.id,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        total: item.total
      });
    }

    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, 'variants'),
      },
    }
  }) as HttpTypes.StoreCartLineItem[]

  // Update cart with GBP totals
  const cartId = await getCartId();
  if (cartId) {
    try {
      const authHeaders = await getAuthHeaders();
      
      console.log('enrichLineItems: Updating cart region to UK:', {
        cartId,
        regionId: ukRegion.id
      });

      // Update cart to use UK region
      await sdk.store.cart.update(
        cartId,
        { region_id: ukRegion.id },
        {},
        authHeaders
      );

      // Don't call revalidateTag here as it's not allowed during render
    } catch (error) {
      console.error('enrichLineItems: Error updating cart:', error);
    }
  }

  return enrichedItems;
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const authHeaders = await getAuthHeaders()

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, authHeaders)
    .then(() => {
      revalidateTag('cart')
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string
    context?: Record<string, unknown>
  }
) {
  const authHeaders = await getAuthHeaders()

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, authHeaders)
    .then((resp) => {
      revalidateTag('cart')
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('No existing cart found')
  }

  await updateCart({ promo_codes: codes })
    .then(() => {
      revalidateTag('cart')
    })
    .catch(medusaError)
}

// export async function applyGiftCard(code: string) {
//   //   const cartId = getCartId()
//   //   if (!cartId) return "No cartId cookie found"
//   //   try {
//   //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
//   //       revalidateTag("cart")
//   //     })
//   //   } catch (error: any) {
//   //     throw error
//   //   }
// }

// export async function removeDiscount(code: string) {
//   // const cartId = getCartId()
//   // if (!cartId) return "No cartId cookie found"
//   // try {
//   //   await deleteDiscount(cartId, code)
//   //   revalidateTag("cart")
//   // } catch (error: any) {
//   //   throw error
//   // }
// }

// export async function removeGiftCard(
//   codeToRemove: string,
//   giftCards: any[]
//   // giftCards: GiftCard[]
// ) {
//   //   const cartId = getCartId()
//   //   if (!cartId) return "No cartId cookie found"
//   //   try {
//   //     await updateCart(cartId, {
//   //       gift_cards: [...giftCards]
//   //         .filter((gc) => gc.code !== codeToRemove)
//   //         .map((gc) => ({ code: gc.code })),
//   //     }).then(() => {
//   //       revalidateTag("cart")
//   //     })
//   //   } catch (error: any) {
//   //     throw error
//   //   }
// }

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get('code') as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error('No form data found when setting addresses')
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error('No existing cart found when setting addresses')
    }

    const data = {
      shipping_address: {
        first_name: formData.get('shipping_address.first_name'),
        last_name: formData.get('shipping_address.last_name'),
        address_1: formData.get('shipping_address.address_1'),
        address_2: '',
        company: formData.get('shipping_address.company'),
        postal_code: formData.get('shipping_address.postal_code'),
        city: formData.get('shipping_address.city'),
        country_code: formData.get('shipping_address.country_code'),
        province: formData.get('shipping_address.province'),
        phone: formData.get('shipping_address.phone'),
      },
      email: formData.get('email'),
    } as any

    const sameAsShipping = formData.get('same_as_shipping')
    if (sameAsShipping === 'on') data.billing_address = data.shipping_address

    if (sameAsShipping !== 'on')
      data.billing_address = {
        first_name: formData.get('billing_address.first_name'),
        last_name: formData.get('billing_address.last_name'),
        address_1: formData.get('billing_address.address_1'),
        address_2: '',
        company: formData.get('billing_address.company'),
        postal_code: formData.get('billing_address.postal_code'),
        city: formData.get('billing_address.city'),
        country_code: formData.get('billing_address.country_code'),
        province: formData.get('billing_address.province'),
        phone: formData.get('billing_address.phone'),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get('shipping_address.country_code') as string}/checkout?step=delivery`
  )
}

export async function placeOrder() {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('No existing cart found when placing an order')
  }

  const authHeaders = await getAuthHeaders()

  const cartRes = await sdk.store.cart
    .complete(cartId, {}, authHeaders)
    .then((cartRes) => {
      revalidateTag('cart')
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === 'order') {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()
    removeCartId()
    redirect(`/${countryCode}/order/confirmed/${cartRes?.order.id}`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag('cart')
  }

  revalidateTag('regions')
  revalidateTag('products')

  redirect(`/${countryCode}${currentPath}`)
}
