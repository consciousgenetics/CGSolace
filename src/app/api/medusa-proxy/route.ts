import { NextRequest, NextResponse } from 'next/server'

// Default timeout for fetch requests (ms)
const FETCH_TIMEOUT = 5000;

/**
 * Fetch with timeout to prevent hanging requests
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

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

  // Prepare headers - minimize operations
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('origin')
  
  // Ensure the publishable API key is included
  const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (apiKey && !headers.has('x-publishable-api-key')) {
    headers.set('x-publishable-api-key', apiKey)
  }
  
  try {
    // Forward the request to the Medusa server with timeout
    const response = await fetchWithTimeout(`${medusaUrl}${path}`, {
      method: 'GET',
      headers: headers,
    }, FETCH_TIMEOUT);

    // Get the response body
    const body = await response.text()
    
    // Create a new response with the same status, headers, and body
    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    // Check if it's a timeout error
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request to Medusa timed out' }, { status: 504 })
    }
    
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

  // Prepare headers - minimize operations
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('origin')
  
  // Ensure the publishable API key is included
  const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (apiKey && !headers.has('x-publishable-api-key')) {
    headers.set('x-publishable-api-key', apiKey)
  }
  
  try {
    // Get the request body
    const body = await request.text()
    
    // Forward the request to the Medusa server with timeout
    const response = await fetchWithTimeout(`${medusaUrl}${path}`, {
      method: 'POST',
      headers: headers,
      body: body
    }, FETCH_TIMEOUT);

    // Get the response body
    const responseBody = await response.text()
    
    // Create a new response with the same status, headers, and body
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    // Check if it's a timeout error
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request to Medusa timed out' }, { status: 504 })
    }
    
    return NextResponse.json({ error: 'Failed to proxy request to Medusa' }, { status: 500 })
  }
} 