import { NextRequest, NextResponse } from 'next/server'

// Debug endpoint to check all cookies and the cart cookie specifically
export async function GET(request: NextRequest) {
  try {
    // Get cookies from request instead of using cookies() API
    const cookieHeader = request.headers.get('cookie') || ''
    const parsedCookies = parseCookies(cookieHeader)
    const cartId = parsedCookies['_medusa_cart_id'] || null
    
    // Get detailed request headers for debugging
    const requestHeaders = Object.fromEntries(request.headers.entries())
    
    return NextResponse.json({
      status: 'success',
      cartId: cartId,
      cookiesCount: Object.keys(parsedCookies).length,
      cookies: Object.entries(parsedCookies).map(([name, value]) => ({
        name,
        value: value ? `${value.substring(0, 6)}...` : null, // Only show part of value for security
      })),
      requestHeaders: {
        host: requestHeaders.host,
        origin: requestHeaders.origin,
        referer: requestHeaders.referer,
        cookie: cookieHeader ? 'Present (truncated)' : 'Not present',
      }
    })
  } catch (error) {
    console.error('Error in cart debug API:', error)
    return NextResponse.json({ 
      status: 'error',
      message: 'Error debugging cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to parse cookie header
function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .filter(Boolean)
    .reduce((acc, cookie) => {
      const [name, value] = cookie.split('=').map(part => part.trim())
      if (name && value !== undefined) {
        acc[name] = value
      }
      return acc
    }, {} as Record<string, string>)
} 