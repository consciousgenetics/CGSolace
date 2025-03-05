import { NextRequest, NextResponse } from 'next/server'

/**
 * This route handles product search requests and forwards them to the Medusa backend
 * via the medusa-proxy
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  
  // Create a URL for the proxy with the path to the store/products endpoint
  const proxyUrl = `/api/medusa-proxy?path=/store/products${query ? `&q=${encodeURIComponent(query)}` : ''}`
  
  try {
    // Forward the request to the medusa-proxy
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`Search API error: ${response.status} ${response.statusText}`)
      return NextResponse.json({ results: [], count: 0 }, { status: 200 })
    }

    const data = await response.json()
    
    // Transform the response to match the expected format
    return NextResponse.json({
      results: data.products || [],
      count: data.count || 0,
    })
  } catch (error) {
    console.error('Search function error:', error)
    return NextResponse.json({ results: [], count: 0 }, { status: 200 })
  }
} 