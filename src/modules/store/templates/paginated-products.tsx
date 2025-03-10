'use client'

import { useEffect, useState } from 'react'
import { ProductTile } from '@modules/products/components/product-tile'
import { PRODUCT_LIMIT } from '@modules/search/actions'
import { Pagination } from '@modules/store/components/pagination'
import { SearchedProduct } from 'types/global'
import { convertToLocale } from '@lib/util/money'

export default function PaginatedProducts({
  products,
  total,
  page,
  countryCode,
  regionData,
}: {
  products: SearchedProduct[]
  total: number
  page: number
  countryCode: string
  regionData?: any // Pass the region data directly instead of fetching it
}) {
  const [region, setRegion] = useState(regionData)
  const totalPages = Math.ceil(total / PRODUCT_LIMIT)
  
  // If region data wasn't passed in, we can fetch it on the client side
  useEffect(() => {
    if (!region && countryCode) {
      // Use a simple fetch instead of the server action
      fetch(`/api/regions?countryCode=${countryCode}`)
        .then(response => response.json())
        .then(data => {
          setRegion(data.region)
        })
        .catch(error => {
          console.error('Error fetching region:', error)
        })
    }
  }, [region, countryCode])

  if (!region) {
    // Show loading state or skeleton while region is being fetched
    return <div className="animate-pulse">Loading products...</div>
  }

  return (
    <>
      <ul
        className="grid w-full grid-cols-1 gap-x-2 gap-y-6 small:grid-cols-2 large:grid-cols-3"
        data-testid="products-list"
      >
        {products.map((p) => {
          // Find the lowest price among all variants
          const lowestPrice = p.variants?.reduce((lowest, variant) => {
            const variantPrice = variant.calculated_price || 
              (variant.prices?.[0]?.amount ?? Infinity);
            return Math.min(lowest, variantPrice);
          }, Infinity);

          const calculatedPrice = lowestPrice !== Infinity
            ? convertToLocale({
                amount: lowestPrice,
                currency_code: region.currency_code,
              })
            : 'N/A';
            
          return (
            <li key={p.id}>
              <ProductTile
                product={{
                  id: p.id,
                  created_at: p.created_at,
                  title: p.title,
                  handle: p.handle,
                  thumbnail: p.thumbnail,
                  calculatedPrice: calculatedPrice,
                  salePrice: calculatedPrice, // Use the same price since we're showing the lowest
                }}
                regionId={region.id}
              />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
