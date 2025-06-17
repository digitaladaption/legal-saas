import { NextRequest, NextResponse } from 'next/server'
import { handleBillingWebhook } from '@/lib/integrations/billing-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())
    
    // Get provider from query params or headers
    const provider = request.nextUrl.searchParams.get('provider') || 
                    headers['x-billing-provider'] || 
                    'unknown'

    console.log(`Received billing webhook from ${provider}:`, body)

    // Process the webhook
    const result = await handleBillingWebhook(provider, body, headers)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message 
      }, { status: 200 })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.message 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Billing webhook error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'billing-webhooks',
    timestamp: new Date().toISOString()
  })
} 