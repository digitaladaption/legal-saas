import { NextRequest, NextResponse } from 'next/server'

interface OAuthConfig {
  client_id: string
  client_secret: string
  redirect_uri: string
  scope: string
  auth_url: string
  token_url: string
}

// OAuth configurations for different platforms
const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  google: {
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/platforms/oauth/callback',
    scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.readonly',
    auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_url: 'https://oauth2.googleapis.com/token'
  },
  microsoft: {
    client_id: process.env.MICROSOFT_CLIENT_ID || '', 
    client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/platforms/oauth/callback',
    scope: 'https://graph.microsoft.com/Files.Read.All https://graph.microsoft.com/Mail.Read',
    auth_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    token_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  },
  slack: {
    client_id: process.env.SLACK_CLIENT_ID || '',
    client_secret: process.env.SLACK_CLIENT_SECRET || '',
    redirect_uri: process.env.SLACK_REDIRECT_URI || 'http://localhost:3000/api/platforms/oauth/callback',
    scope: 'channels:history,channels:read,files:read,search:read,users:read',
    auth_url: 'https://slack.com/oauth/v2/authorize',
    token_url: 'https://slack.com/api/oauth.v2.access'
  },
  zoom: {
    client_id: process.env.ZOOM_CLIENT_ID || '',
    client_secret: process.env.ZOOM_CLIENT_SECRET || '',
    redirect_uri: process.env.ZOOM_REDIRECT_URI || 'http://localhost:3000/api/platforms/oauth/callback',
    scope: 'recording:read:admin,meeting:read:admin',
    auth_url: 'https://zoom.us/oauth/authorize',
    token_url: 'https://zoom.us/oauth/token'
  }
}

// Initialize OAuth flow
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const action = searchParams.get('action')

    if (!platform || !OAUTH_CONFIGS[platform]) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or unsupported platform' 
      }, { status: 400 })
    }

    const config = OAUTH_CONFIGS[platform]

    if (action === 'authorize') {
      // Generate state parameter for security
      const state = generateState(platform)
      
      const authUrl = new URL(config.auth_url)
      authUrl.searchParams.set('client_id', config.client_id)
      authUrl.searchParams.set('redirect_uri', config.redirect_uri)
      authUrl.searchParams.set('scope', config.scope)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('state', state)
      
      // Add platform-specific parameters
      if (platform === 'microsoft') {
        authUrl.searchParams.set('response_mode', 'query')
      }

      return NextResponse.json({ 
        success: true, 
        auth_url: authUrl.toString(),
        state: state
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 })

  } catch (error) {
    console.error('OAuth initialization error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize OAuth' 
    }, { status: 500 })
  }
}

// Handle OAuth token exchange
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, code, state } = body

    if (!platform || !code || !OAUTH_CONFIGS[platform]) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters or invalid platform' 
      }, { status: 400 })
    }

    // Verify state parameter
    if (!verifyState(state, platform)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid state parameter' 
      }, { status: 400 })
    }

    const config = OAUTH_CONFIGS[platform]
    
    const tokenResponse = await fetch(config.token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        client_id: config.client_id,
        client_secret: config.client_secret,
        code: code,
        redirect_uri: config.redirect_uri,
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to exchange code for token' 
      }, { status: 400 })
    }

    // Store tokens securely (in production, use proper storage)
    const credentials = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      obtained_at: new Date().toISOString()
    }

    // Add platform-specific data
    if (platform === 'slack') {
      credentials.team_id = tokenData.team?.id
      credentials.team_name = tokenData.team?.name
    }

    return NextResponse.json({ 
      success: true, 
      credentials: credentials,
      platform: platform
    })

  } catch (error) {
    console.error('OAuth token exchange error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error during token exchange' 
    }, { status: 500 })
  }
}

// Generate secure state parameter
function generateState(platform: string): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 15)
  return Buffer.from(`${platform}:${timestamp}:${random}`).toString('base64')
}

// Verify state parameter
function verifyState(state: string, platform: string): boolean {
  try {
    const decoded = Buffer.from(state, 'base64').toString('utf-8')
    const [statePlatform, timestamp, random] = decoded.split(':')
    
    // Check platform matches
    if (statePlatform !== platform) {
      return false
    }
    
    // Check timestamp is within last 10 minutes
    const stateTime = parseInt(timestamp)
    const now = Date.now()
    const tenMinutes = 10 * 60 * 1000
    
    return (now - stateTime) < tenMinutes
    
  } catch (error) {
    return false
  }
} 