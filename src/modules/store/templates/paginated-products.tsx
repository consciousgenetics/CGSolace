'use client'

import { useEffect, useState, useMemo } from 'react'
import { ProductTile } from '@modules/products/components/product-tile'
import { PRODUCT_LIMIT } from '@modules/search/actions'
import { Pagination } from '@modules/store/components/pagination'
import { SearchedProduct } from 'types/global'
import { getProductPrice } from '@lib/util/get-product-price'

// Store region data in a global cache to prevent repeated fetches
const regionCache = new Map();

// Helper function to ensure products have valid variants and prices
function ensureValidProductData(product: any, currencyCode: string): any {
  if (!product) return product
  
  // Clone the product to avoid modifying the original
  const validatedProduct = { ...product }
  
  // Ensure product has variants
  if (!validatedProduct.variants || !Array.isArray(validatedProduct.variants) || validatedProduct.variants.length === 0) {
    validatedProduct.variants = [{
      id: 'dummy-variant',
      title: 'Default',
      prices: [{
        currency_code: currencyCode,
        amount: 0
      }],
      calculated_price: {
        calculated_amount: 0,
        original_amount: 0,
        currency_code: currencyCode
      }
    }]
  } else {
    // Ensure all variants have prices
    validatedProduct.variants = validatedProduct.variants.map(variant => {
      // Use type assertion for variant to handle prices property
      const variantAny = variant as any;
      if (!variantAny.prices || !Array.isArray(variantAny.prices) || variantAny.prices.length === 0) {
        return {
          ...variant,
          prices: [{
            currency_code: currencyCode,
            amount: 0
          }]
        }
      }
      return variant
    })
  }
  
  return validatedProduct
}

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
  // Check cache first before setting initial state
  const cachedRegion = regionCache.get(countryCode);
  const [region, setRegion] = useState(regionData || cachedRegion);
  const totalPages = Math.ceil(total / PRODUCT_LIMIT)
  
  // If region data wasn't passed in, we can fetch it on the client side
  useEffect(() => {
    if (!region && countryCode) {
      // Check cache again
      if (regionCache.has(countryCode)) {
        setRegion(regionCache.get(countryCode));
        return;
      }
      
      // Set a fetch timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Use a simple fetch with timeout
      fetch(`/api/regions?countryCode=${countryCode}`, {
        signal: controller.signal
      })
        .then(response => response.json())
        .then(data => {
          // Store in cache and state
          regionCache.set(countryCode, data.region);
          setRegion(data.region);
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            console.warn('Region fetch timed out, using default GBP');
            // Use a default region to avoid leaving products in loading state
            const defaultRegion = { currency_code: 'GBP', id: 'default' };
            regionCache.set(countryCode, defaultRegion);
            setRegion(defaultRegion);
          } else {
            console.error('Error fetching region:', error);
          }
        })
        .finally(() => {
          clearTimeout(timeoutId);
        });
    }
  }, [region, countryCode]);

  // If no region data yet, show minimal loading state
  if (!region) {
    return <div className="animate-pulse">Loading...</div>
  }

  // Ensure all products have valid variants and prices - do this once
  const validatedProducts = useMemo(() => {
    return products.map(p => ensureValidProductData(p, region.currency_code || 'GBP'));
  }, [products, region.currency_code]);
  
  return (
    <>
      <ul
        className="grid w-full grid-cols-1 gap-x-2 gap-y-6 small:grid-cols-2 large:grid-cols-3"
        data-testid="products-list"
      >
        {validatedProducts.map((p) => {
          // Get the cheapest price using the getProductPrice utility function
          try {
            const { cheapestPrice } = getProductPrice({
              product: p,
            })

            // Better handling of potentially invalid price values
            const calculated = cheapestPrice?.calculated_price_number
            
            // Be more permissive - accept any numeric value (including 0)
            const hasValidCalculatedPrice = calculated !== undefined && 
                                           calculated !== null && 
                                           !isNaN(calculated)
                                           
            // Use the EXACT same fallback text as ProductCarousel: "Price unavailable"
            const calculatedPrice = hasValidCalculatedPrice
              ? cheapestPrice?.calculated_price
              : 'Price unavailable'
            
            const original = cheapestPrice?.original_price_number
            
            // Be more permissive with original price validation too
            const hasValidOriginalPrice = original !== undefined && 
                                         original !== null && 
                                         !isNaN(original)
                                         
            // For original price, if not available, use the calculated price as fallback
            const originalPrice = hasValidOriginalPrice
              ? cheapestPrice?.original_price
              : calculatedPrice
              
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
                    salePrice: originalPrice,
                  }}
                  regionId={region.id}
                />
              </li>
            )
          } catch (error) {
            // Provide a fallback in case of error - match ProductCarousel
            return (
              <li key={p.id}>
                <ProductTile
                  product={{
                    id: p.id,
                    created_at: p.created_at,
                    title: p.title,
                    handle: p.handle,
                    thumbnail: p.thumbnail,
                    calculatedPrice: 'Price unavailable',
                    salePrice: 'Price unavailable',
                  }}
                  regionId={region.id}
                />
              </li>
            )
          }
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
