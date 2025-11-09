import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET - Fetch vendor override by slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('vendor_overrides')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('Error fetching vendor override:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/vendors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update vendor override
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, customDescription, website, founded, headquarters } = body

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Use upsert to create or update
    const { data, error } = await supabase
      .from('vendor_overrides')
      .upsert({
        slug,
        custom_description: customDescription || null,
        website: website || null,
        founded: founded || null,
        headquarters: headquarters || null,
      }, {
        onConflict: 'slug'
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting vendor override:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error in POST /api/vendors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete vendor override
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('vendor_overrides')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('Error deleting vendor override:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/vendors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
