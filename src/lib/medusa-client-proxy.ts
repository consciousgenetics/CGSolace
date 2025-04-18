/**
 * This file creates a modified fetch function for the Medusa client to use our proxy
 * instead of directly accessing the Medusa backend, avoiding CORS issues
 */

import Medusa from '@medusajs/medusa-js'

// Cache for storing responses - using a simpler implementation than before
const responseCache = new Map<string, {response: Response, timestamp: number}>();

// For rate limiting, track requests by endpoint with minimal detail
const requestLimiter = {
  // Track recent requests by path
  recentRequests: new Map<string, number[]>(),
  
  // Record a request for an endpoint
  recordRequest: (path: string) => {
    const now = Date.now();
    const recent = requestLimiter.recentRequests.get(path) || [];
    
    // Only keep requests from the last 5 seconds
    const filtered = recent.filter(time => (now - time) < 5000);
    filtered.push(now);
    
    requestLimiter.recentRequests.set(path, filtered);
    return filtered.length;
  },
  
  // Check if we should rate limit
  shouldLimit: (path: string): boolean => {
    const recent = requestLimiter.recentRequests.get(path) || [];
    // If more than 3 requests in the last 5 seconds, then limit
    return recent.length > 3;
  }
};

/**
 * Creates a fetch function that routes requests through our Next.js API proxy
 * to avoid CORS issues when accessing the Medusa backend from the browser
 */
export const createProxyFetch = () => {
  // The original fetch function
  const originalFetch = window.fetch;
  
  // The URL of our Medusa backend
  const medusaBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || '';
  
  // Return a new fetch function that intercepts Medusa API calls
  // Use Promise-based approach instead of async/await for client component compatibility
  return function proxyFetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Check if this is a request to the Medusa backend
    if (typeof url === 'string' && url.startsWith(medusaBackendUrl)) {
      // Extract the path from the URL (everything after the domain)
      const path = url.substring(medusaBackendUrl.length);
      
      // Only GET requests should be cached and rate limited
      const method = init?.method || 'GET';
      const isCacheable = method === 'GET';
      
      // Simple cache key based on URL and method
      const cacheKey = `${method}:${url}`;
      
      // For GET requests, check cache
      if (isCacheable) {
        // Check for cached response
        const cached = responseCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < 60000) { // 1 minute cache
          return Promise.resolve(cached.response.clone());
        }
        
        // Check for rate limiting
        if (requestLimiter.shouldLimit(path)) {
          // For rate-limited requests, delay slightly but still process
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(originalFetch(url, init));
            }, 500); // 500ms delay
          });
        }
      }
      
      // Record this request for rate limiting
      requestLimiter.recordRequest(path);
      
      // Redirect to our proxy endpoint with the path as a query parameter
      const proxyUrl = `/api/medusa-proxy?path=${encodeURIComponent(path)}`;
      
      // Make the fetch request
      const fetchPromise = originalFetch(proxyUrl, init).then(response => {
        // Cache successful GET responses
        if (isCacheable && response.ok) {
          responseCache.set(cacheKey, {
            response: response.clone(),
            timestamp: Date.now()
          });
        }
        return response;
      });
      
      return fetchPromise;
    }
    
    // For all other requests, use the original fetch
    return originalFetch(url, init);
  };
};

/**
 * Helper function to detect if we're running in a browser environment
 */
export const isBrowser = () => {
  return typeof window !== 'undefined';
};

/**
 * Apply the proxy fetch function if we're in the browser
 */
export const applyProxyFetch = () => {
  if (isBrowser()) {
    // Replace the global fetch function with our proxy fetch
    const proxyFetch = createProxyFetch();
    
    // Store original fetch for later use
    const originalFetch = window.fetch;
    
    // Replace global fetch with our proxy
    window.fetch = proxyFetch as typeof fetch;
    
    // Return a function to restore the original fetch if needed
    return () => {
      window.fetch = originalFetch;
    };
  }
  
  // If not in a browser, return a no-op function
  return () => {};
};

/**
 * createMedusaClient returns a Medusa client with a modified fetch function that proxies requests
 * through the Next.js API to avoid CORS issues. This approach is needed for client-side usage.
 */

export function createClient() {
  if (typeof window === 'undefined') {
    // For server-side, we can use the Medusa client directly
    return new Medusa({
      baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || '',
      maxRetries: 3,
      publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    })
  }

  if (!process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
    throw new Error('NEXT_PUBLIC_MEDUSA_BACKEND_URL is not defined')
  }

  // For client-side, we need to proxy the requests through the Next.js API
  return new Medusa({
    baseUrl: '/api/medusa-proxy', // Proxy through our Next.js API route
    maxRetries: 3,
    publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    customHeaders: {
      'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
    }
  })
}

export function notifyOnNetworkStatusChange() {
  if (typeof window === 'undefined') {
    // If not in a browser, return a no-op function
    return () => {};
  };
} 