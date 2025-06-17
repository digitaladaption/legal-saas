import { NextRequest, NextResponse } from 'next/server'

// OAuth callback handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, error_description)
      return NextResponse.redirect(
        new URL(`/agent/settings?error=${encodeURIComponent(error_description || error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/agent/settings?error=Missing authorization code or state', request.url)
      )
    }

    // Decode state to get platform
    let platform: string
    try {
      const decoded = Buffer.from(state, 'base64').toString('utf-8')
      platform = decoded.split(':')[0]
    } catch (error) {
      return NextResponse.redirect(
        new URL('/agent/settings?error=Invalid state parameter', request.url)
      )
    }

    // Exchange code for token by calling our own API
    const tokenExchange = await fetch(new URL('/api/platforms/oauth', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform,
        code,
        state
      })
    })

    const tokenResult = await tokenExchange.json()

    if (!tokenResult.success) {
      return NextResponse.redirect(
        new URL(`/agent/settings?error=${encodeURIComponent(tokenResult.error)}`, request.url)
      )
    }

    // Success - redirect back to settings with success message
    const successParams = new URLSearchParams({
      success: 'true',
      platform: platform,
      message: `Successfully connected to ${platform}`
    })

    return NextResponse.redirect(
      new URL(`/agent/settings?${successParams.toString()}`, request.url)
    )

  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/agent/settings?error=OAuth callback failed', request.url)
    )
  }
} 