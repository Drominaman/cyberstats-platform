import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    // Simple password check
    if (password === adminPassword) {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${adminPassword}:${Date.now()}`).toString('base64')

      return NextResponse.json({
        success: true,
        token
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
