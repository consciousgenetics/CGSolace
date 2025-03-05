'use client'

import { useEffect } from 'react'
import { applyProxyFetch } from '@lib/medusa-client-proxy'

/**
 * This component initializes the proxy fetch for API calls
 * It must be used as a client component to avoid issues with server-side rendering
 */
export function CorsProxyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply the proxy fetch when the component mounts
    const restoreFetch = applyProxyFetch()
    
    // Restore the original fetch when the component unmounts
    return () => {
      restoreFetch()
    }
  }, [])
  
  return <>{children}</>
} 