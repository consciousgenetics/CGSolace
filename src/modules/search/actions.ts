import { safeDecodeURIComponent } from '@lib/util/safe-decode-uri'
import { SearchedProducts } from 'types/global'

export const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
export const PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export const PRODUCT_LIMIT = 24

// Helper function to ensure backend URL has a protocol
export const getBackendUrl = (url = BACKEND_URL) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}

type SearchParams = {
  currency_code: string
  page?: number
  order?: string
  category_id?: string
  collection?: string[]
  type?: string[]
  material?: string[]
  price?: string[]
  query?: string
}

export function search({
  currency_code,
  page = 1,
  order = 'relevance',
  category_id,
  collection,
  type,
  material,
  price,
  query,
}: SearchParams): Promise<SearchedProducts> {
  return new Promise((resolve) => {
    try {
      const sortBy =
        order === 'price_asc'
          ? 'calculated_price'
          : order === 'price_desc'
            ? '-calculated_price'
            : order === 'created_at'
              ? '-created_at'
              : order

      const searchParams = new URLSearchParams({
        currency_code,
        order: sortBy,
        offset: ((page - 1) * PRODUCT_LIMIT).toString(),
        limit: PRODUCT_LIMIT.toString(),
        fields: '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices'
      })

      if (category_id) {
        searchParams.append('category_id[]', category_id)
      }

      if (collection && Array.isArray(collection)) {
        collection.forEach((id) => {
          searchParams.append('collection_id[]', id)
        })
      }

      if (type && Array.isArray(type)) {
        type.forEach((id) => {
          searchParams.append('type_id[]', id)
        })
      }

      if (material && Array.isArray(material)) {
        material.forEach((id) => {
          searchParams.append('materials[]', id)
        })
      }

      if (price && Array.isArray(price)) {
        price.forEach((range) => {
          switch (range) {
            case 'under-100':
              searchParams.append('price_to', '100')
              break
            case '100-500':
              searchParams.append('price_from', '100')
              searchParams.append('price_to', '500')
              break
            case '501-1000':
              searchParams.append('price_from', '501')
              searchParams.append('price_to', '1000')
              break
            case 'more-than-1000':
              searchParams.append('price_from', '1000')
              break
          }
        })
      }

      if (query) {
        searchParams.append('q', safeDecodeURIComponent(query))
      }

      // Instead of calling the backend directly, use the medusa-proxy
      // Create a URL for the proxy with the path to the store/products endpoint
      const proxyUrl = `/api/medusa-proxy?path=/store/products${searchParams ? `&${searchParams.toString()}` : ''}`
      
      // Log the search URL without disrupting the flow (for debugging)
      console.log('Search URL (proxy):', proxyUrl);
      
      fetch(proxyUrl, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY!,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })
      .then((response) => {
        // If the endpoint doesn't exist (404), return empty results silently without logging an error
        if (response.status === 404) {
          // Rather than logging a warning every time, we'll silently handle this as expected behavior
          // The search API endpoint may not be available in all Medusa installations
          return null;
        }

        if (!response.ok) {
          console.error(`Search API error: ${response.status} ${response.statusText}`);
          return null;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Invalid content type: ${contentType}`);
          return null;
        }

        return response.text();
      })
      .then((text) => {
        // Skip processing if text is null or undefined (early returns above)
        if (text === null || text === undefined) {
          resolve({
            results: [],
            count: 0,
          });
          return;
        }
        
        try {
          // Check if text is empty or just whitespace
          if (!text || text.trim() === '') {
            console.warn('Empty response received from search API');
            resolve({
              results: [],
              count: 0,
            });
            return;
          }
          
          const data = JSON.parse(text);
          resolve({
            results: data.products || [],
            count: data.count || 0,
          });
        } catch (e) {
          console.error('JSON parse error:', e);
          console.error('Response text starts with:', text ? text.substring(0, 200) + '...' : 'undefined');
          resolve({
            results: [],
            count: 0,
          });
        }
      })
      .catch(fetchError => {
        console.warn('Failed to fetch search results. Using default empty results:', fetchError.message);
        resolve({
          results: [],
          count: 0,
        });
      });
    } catch (error) {
      console.error('Search function error:', error);
      resolve({
        results: [],
        count: 0,
      });
    }
  });
}
