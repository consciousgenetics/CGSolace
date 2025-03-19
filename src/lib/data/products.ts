import { unstable_noStore as noStore } from 'next/cache'
import { StoreGetProductsParams } from "@medusajs/medusa"
import { HttpTypes } from '@medusajs/types'

import { sdk } from '@lib/config'
import { BACKEND_URL, PUBLISHABLE_API_KEY, getBackendUrl } from '@modules/search/actions'
import { ProductFilters } from 'types/global'

import { getRegion } from './regions'

export const getProductsById = async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*categories,+metadata',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products }) => products)
}

export const getProductByHandle = async function (
  handle: string,
  regionId: string
) {
  console.log(`getProductByHandle: Fetching product with handle "${handle}" for region "${regionId}"`)
  
  try {
    const response = await sdk.store.product
      .list(
        {
          handle,
          region_id: regionId,
          fields:
            '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*categories,+metadata',
        },
        { next: { tags: ['products'] } }
      )
    
    console.log(`getProductByHandle: Found ${response.products.length} products for handle "${handle}"`)
    
    if (response.products.length === 0) {
      console.warn(`getProductByHandle: No products found for handle "${handle}"`)
      return null
    }
    
    const product = response.products[0]
    console.log(`getProductByHandle: Product details:`, {
      id: product.id,
      title: product.title,
      thumbnail: product.thumbnail,
      images: product.images?.length || 0
    })
    
    return product
  } catch (error) {
    console.error(`getProductByHandle: Error fetching product with handle "${handle}":`, error)
    throw error
  }
}

export async function getProductsList({
  pageParam = 0,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.StoreProductParams
  countryCode: string
}) {
  const region = await getRegion(countryCode);

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    };
  }

  return sdk.store.product
    .list({
      limit: queryParams?.limit || 12,
      offset: pageParam,
      region_id: region.id,
      fields: '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*categories,+metadata',
      ...(queryParams || {}),
    }, {
      next: { tags: ['products'] }
    })
    .then(({ products, count }) => {
      // Log the products with their categories for debugging
      console.log('Products fetched with categories:', products.map(p => ({
        id: p.id,
        title: p.title,
        categories: p.categories?.map(c => ({
          id: c.id,
          handle: c.handle,
          name: c.name
        }))
      })));

      return {
        response: {
          products,
          count,
        },
        nextPage: products.length === queryParams?.limit ? pageParam + 1 : null,
        queryParams,
      };
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
      return {
        response: { products: [], count: 0 },
        nextPage: null,
        queryParams,
      };
    });
}

export const getProductsListByCollectionId = async function ({
  collectionId,
  countryCode,
  excludeProductId,
  limit = 12,
  offset = 0,
}: {
  collectionId: string
  countryCode: string
  excludeProductId?: string
  limit?: number
  offset?: number
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
}> {
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  return sdk.store.product
    .list(
      {
        limit,
        offset,
        collection_id: [collectionId],
        region_id: region.id,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products, count }) => {
      if (excludeProductId) {
        products = products.filter((product) => product.id !== excludeProductId)
      }

      const nextPage = count > offset + limit ? offset + limit : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
      }
    })
}

export const getStoreFilters = async function () {
  try {
    // Use the helper function to ensure the backend URL has a proper protocol
    const backendUrl = getBackendUrl();
    
    // Use a default empty response if no backend URL is available
    if (!backendUrl) {
      console.warn('No backend URL configured for filters');
      return { collection: [], type: [], material: [] };
    }
    
    try {
      const response = await fetch(
        `${backendUrl}/store/filter-product-attributes`,
        {
          headers: {
            'x-publishable-api-key': PUBLISHABLE_API_KEY!,
            'Accept': 'application/json',
          },
          next: {
            revalidate: 3600,
          },
        }
      );

      // If the endpoint doesn't exist (404), return empty arrays silently without logging an error
      if (response.status === 404) {
        console.warn('Filter API endpoint not available. Using default empty filters.');
        return { collection: [], type: [], material: [] };
      }

      if (!response.ok) {
        console.error(`Filter API error: ${response.status} ${response.statusText}`);
        return { collection: [], type: [], material: [] };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`Invalid content type: ${contentType}`);
        return { collection: [], type: [], material: [] };
      }

      const text = await response.text();
      
      try {
        const rawFilters = JSON.parse(text);
        
        // Transform the response to match ProductFilters type
        const filters: ProductFilters = {
          collection: (rawFilters.collections || []).map((c: any) => ({
            id: c.id || c.value,
            value: c.value
          })),
          type: (rawFilters.types || []).map((t: any) => ({
            id: t.id || t.value,
            value: t.value
          })),
          material: (rawFilters.materials || []).map((m: any) => ({
            id: m.id || m.value,
            value: m.value
          }))
        };
        
        return filters;
      } catch (e) {
        console.error('JSON parse error:', e);
        console.error('Response text starts with:', text.substring(0, 200) + '...');
        return { collection: [], type: [], material: [] };
      }
    } catch (fetchError) {
      console.warn('Failed to fetch filters. Using default empty filters:', fetchError.message);
      return { collection: [], type: [], material: [] };
    }
  } catch (error) {
    console.error('Filter function error:', error);
    return { collection: [], type: [], material: [] };
  }
}
