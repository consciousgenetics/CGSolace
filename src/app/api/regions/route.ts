import { NextRequest, NextResponse } from 'next/server'
import { getRegion } from '@lib/data/regions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('countryCode')
    
    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      )
    }
    
    const region = await getRegion(countryCode)
    
    if (!region) {
      return NextResponse.json(
        { error: 'Region not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ region })
  } catch (error) {
    console.error('Error in regions API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 