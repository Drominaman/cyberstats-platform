import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const apiKey = process.env.NEXT_PUBLIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // Build URL with all query parameters
  const params = new URLSearchParams()
  params.set('key', apiKey)
  params.set('format', 'json')

  // Forward all search parameters
  const q = searchParams.get('q')
  const limit = searchParams.get('limit') || '50'
  const offset = searchParams.get('offset') || '0'
  const sort = searchParams.get('sort')
  const count = searchParams.get('count')

  if (q) params.set('q', q)
  params.set('limit', limit)
  params.set('offset', offset)
  if (sort) params.set('sort', sort)
  if (count) params.set('count', count)

  try {
    const response = await fetch(
      `https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats?${params.toString()}`
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: 'Upstream API error', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    )
  }
}
