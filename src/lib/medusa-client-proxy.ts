/**
 * This file creates a modified fetch function for the Medusa client to use our proxy
 * instead of directly accessing the Medusa backend, avoiding CORS issues
 */

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
      
      // Redirect to our proxy endpoint with the path as a query parameter
      const proxyUrl = `/api/medusa-proxy?path=${encodeURIComponent(path)}`;
      
      // Call the proxy endpoint instead
      return originalFetch(proxyUrl, init);
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