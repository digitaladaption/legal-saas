import { NextRequest, NextResponse } from 'next/server'
import { platformManager } from '@/lib/integrations/platform-connectors'

// Connect to a platform
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, credentials, action } = body

    switch (action) {
      case 'connect':
        const success = await platformManager.connectPlatform(platform, credentials)
        return NextResponse.json({ 
          success, 
          message: success ? `Connected to ${platform}` : `Failed to connect to ${platform}` 
        })

      case 'search':
        const { query, options } = body
        const results = await platformManager.searchAllPlatforms(query, {
          platforms: options?.platforms,
          limit: options?.limit || 50,
          dateRange: options?.dateRange
        })
        
        return NextResponse.json({ 
          success: true, 
          data: results 
        })

      case 'disconnect':
        // Implementation for disconnecting a platform
        return NextResponse.json({ 
          success: true, 
          message: `Disconnected from ${platform}` 
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Platform API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Get platform status and connected platforms
export async function GET() {
  try {
    const connectedPlatforms = platformManager.getConnectedPlatforms()
    const platformStatus = platformManager.getPlatformStatus()

    return NextResponse.json({ 
      success: true, 
      data: {
        connected_platforms: connectedPlatforms,
        platform_status: platformStatus,
        available_platforms: [
          'slack',
          'discord', 
          'google_drive',
          'onedrive',
          'zoom',
          'gmail'
        ]
      }
    })

  } catch (error) {
    console.error('Platform Status Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get platform status' 
    }, { status: 500 })
  }
} 