'use client'

import { useEffect, useState, useMemo } from 'react'
import { ProductTile } from '@modules/products/components/product-tile'
import { PRODUCT_LIMIT } from '@modules/search/actions'
import { Pagination } from '@modules/store/components/pagination'
import { SearchedProduct } from 'types/global'
import { getProductPrice, getCurrencyFromCountry, clearPriceCache, normalizeCurrency } from '@lib/util/get-product-price'

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

// Helper to check if a product might have price issues
function hasEuroPriceOnly(product: any): boolean {
  if (!product || !product.variants) return false;
  
  // Check if the product has any GBP prices
  const hasGbpPrice = product.variants.some((variant: any) => {
    if (!variant.prices || !Array.isArray(variant.prices)) return false;
    return variant.prices.some((price: any) => normalizeCurrency(price.currency_code) === 'GBP');
  });
  
  // Check if the product has any EUR prices
  const hasEurPrice = product.variants.some((variant: any) => {
    if (!variant.prices || !Array.isArray(variant.prices)) return false;
    return variant.prices.some((price: any) => normalizeCurrency(price.currency_code) === 'EUR');
  });
  
  // Return true if the product has EUR prices but no GBP prices
  return hasEurPrice && !hasGbpPrice;
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
  const [previousCountryCode, setPreviousCountryCode] = useState(countryCode);
  const totalPages = Math.ceil(total / PRODUCT_LIMIT)
  
  // Clear price cache when country changes to force recalculation
  useEffect(() => {
    if (previousCountryCode !== countryCode) {
      console.log(`Country changed from ${previousCountryCode} to ${countryCode}, clearing price cache`);
      
      // Clear any cached prices from previous country
      products.forEach(product => {
        if (product.variants) {
          product.variants.forEach((variant: any) => {
            if (variant && variant.id) {
              // Clear cache for both formats of cache key
              clearPriceCache(variant.id);
              clearPriceCache(`${variant.id}_${previousCountryCode}`);
              clearPriceCache(`${variant.id}_${countryCode}`);
            }
          });
        }
      });
      
      setPreviousCountryCode(countryCode);
    }
  }, [countryCode, previousCountryCode, products]);
  
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
            console.warn('Region fetch timed out, using default currency for', countryCode);
            // Use a default region with the correct currency based on country code
            const currency = countryCode === 'us' ? 'USD' : countryCode === 'dk' ? 'EUR' : 'GBP';
            const defaultRegion = { currency_code: currency, id: 'default' };
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

  // Get the appropriate currency based on current country code
  const expectedCurrency = getCurrencyFromCountry(countryCode);
  console.log(`PaginatedProducts: Country code ${countryCode}, using currency ${expectedCurrency}`);

  // Check for products that might have euro prices only when in GB locale
  if (countryCode === 'gb') {
    const euroPriceOnlyProducts = products.filter(p => hasEuroPriceOnly(p));
    if (euroPriceOnlyProducts.length > 0) {
      console.warn(`Found ${euroPriceOnlyProducts.length} products with EUR prices but no GBP prices:`, 
        euroPriceOnlyProducts.map(p => p.title).join(', '));
    }
  }

  // Ensure all products have valid variants and prices - do this once
  const validatedProducts = useMemo(() => {
    // Use the expected currency based on country code, don't fall back to region.currency_code
    return products.map(p => ensureValidProductData(p, expectedCurrency));
  }, [products, countryCode, expectedCurrency]);
  
  return (
    <>
      <ul
        className="grid w-full grid-cols-1 gap-x-4 gap-y-8 small:grid-cols-2 large:grid-cols-3 justify-center"
        data-testid="products-list"
      >
        {validatedProducts.map((p) => {
          // Get the cheapest price using the getProductPrice utility function
          try {
            // If we already have a calculated price from the parent component, use it
            if (p.calculatedPrice && p.calculatedPrice !== "0" && p.calculatedPrice !== "Price unavailable") {
              return (
                <li key={p.id}>
                  <ProductTile
                    product={{
                      id: p.id,
                      created_at: p.created_at,
                      title: p.title,
                      handle: p.handle,
                      thumbnail: p.thumbnail,
                      calculatedPrice: p.calculatedPrice,
                      salePrice: p.salePrice,
                    }}
                    regionId={region.id}
                  />
                </li>
              );
            }

            // For debugging problematic products
            const debugProduct = p.title && (
              p.title.includes('Red Kachina') || 
              hasEuroPriceOnly(p)
            );

            if (debugProduct && countryCode === 'gb') {
              console.log(`Debugging price for product "${p.title}" in ${countryCode}:`);
              
              // Log all available prices across variants
              if (p.variants) {
                p.variants.forEach((v: any, i: number) => {
                  if (v.prices) {
                    console.log(`Variant ${i+1} prices:`, v.prices.map((price: any) => 
                      `${price.amount} ${price.currency_code}`
                    ));
                  }
                });
              }
            }

            // Otherwise calculate the price - Now passing the countryCode parameter
            const { cheapestPrice } = getProductPrice({
              product: p,
            });

            console.log('Calculated new price:', {
              id: p.id,
              cheapestPrice,
              currency: cheapestPrice?.currency_code
            });

            // Better handling of potentially invalid price values
            const calculated = cheapestPrice?.calculated_price_number;
            
            // Be more permissive - accept any numeric value (including 0)
            const hasValidCalculatedPrice = calculated !== undefined && 
                                         calculated !== null && 
                                         !isNaN(calculated);
                                         
            // Use the EXACT same fallback text as ProductCarousel: "Price unavailable"
            const calculatedPrice = hasValidCalculatedPrice
              ? cheapestPrice?.calculated_price
              : 'Price unavailable';
            
            const original = cheapestPrice?.original_price_number;
            
            // Be more permissive with original price validation too
            const hasValidOriginalPrice = original !== undefined && 
                                       original !== null && 
                                       !isNaN(original);
                                       
            // For original price, if not available, use the calculated price as fallback
            const originalPrice = hasValidOriginalPrice
              ? cheapestPrice?.original_price
              : calculatedPrice;
            
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
            console.error(`Error processing product ${p.title}:`, error);
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
