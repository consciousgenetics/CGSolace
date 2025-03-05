import { NextRequest, NextResponse } from 'next/server'

/**
 * This route acts as a proxy for the Medusa backend to avoid CORS issues
 * It forwards requests from the client to the Medusa server and sends the response back
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')
  
  if (!path) {
    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
  }
  
  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!medusaUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set' }, { status: 500 })
  }

  // Forward the headers from the original request
  const headers = new Headers(request.headers)
  
  // Remove host and origin headers to avoid conflicts
  headers.delete('host')
  headers.delete('origin')
  
  try {
    // Forward the request to the Medusa server
    const response = await fetch(`${medusaUrl}${path}`, {
      method: 'GET',
      headers: headers,
    })

    // Get the response body
    const body = await response.text()
    
    // Create a new response with the same status, headers, and body
    const proxyResponse = new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
    
    return proxyResponse
  } catch (error) {
    console.error('Error proxying request to Medusa:', error)
    return NextResponse.json({ error: 'Failed to proxy request to Medusa' }, { status: 500 })
  }
}

/**
 * Set up CORS for OPTIONS requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

/**
 * Forward POST requests to Medusa
 */
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')
  
  if (!path) {
    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
  }
  
  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!medusaUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set' }, { status: 500 })
  }

  // Forward the headers from the original request
  const headers = new Headers(request.headers)
  
  // Remove host and origin headers to avoid conflicts
  headers.delete('host')
  headers.delete('origin')
  
  try {
    // Get the request body
    const body = await request.text()
    
    // Forward the request to the Medusa server
    const response = await fetch(`${medusaUrl}${path}`, {
      method: 'POST',
      headers: headers,
      body: body
    })

    // Get the response body
    const responseBody = await response.text()
    
    // Create a new response with the same status, headers, and body
    const proxyResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
    
    return proxyResponse
  } catch (error) {
    console.error('Error proxying request to Medusa:', error)
    return NextResponse.json({ error: 'Failed to proxy request to Medusa' }, { status: 500 })
  }
} 