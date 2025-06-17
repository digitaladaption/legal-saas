import { NextRequest, NextResponse } from 'next/server'
import { createBillingService } from '@/lib/integrations/billing-service'
import { createCourtFilingService } from '@/lib/integrations/court-filing-service'
import { createLegalResearchService } from '@/lib/integrations/legal-research-service'
import { createCalendarService } from '@/lib/integrations/calendar-service'

interface Integration {
  id: string
  name: string
  type: 'billing' | 'court_filing' | 'legal_research' | 'calendar'
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  description: string
  credentials_configured: boolean
  last_sync?: string
  sync_frequency: string
  features: string[]
  created_at: string
  updated_at: string
}

// Mock data - in real app would come from database
const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'QuickBooks Online',
    type: 'billing',
    provider: 'QuickBooks',
    status: 'connected',
    description: 'Sync invoices and payments with QuickBooks Online',
    credentials_configured: true,
    last_sync: '2024-06-15T10:30:00Z',
    sync_frequency: 'hourly',
    features: ['Invoice Creation', 'Payment Tracking', 'Client Sync', 'Expense Management'],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-06-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'CM/ECF Integration',
    type: 'court_filing',
    provider: 'CM/ECF',
    status: 'connected',
    description: 'File documents electronically with federal courts',
    credentials_configured: true,
    last_sync: '2024-06-14T16:45:00Z',
    sync_frequency: 'daily',
    features: ['Document Filing', 'Case Status Updates', 'Docket Retrieval', 'Service Lists'],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-06-14T16:45:00Z'
  }
]

// GET - List all integrations
export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type')
    
    let integrations = mockIntegrations
    
    if (type) {
      integrations = integrations.filter(i => i.type === type)
    }

    return NextResponse.json({
      success: true,
      data: integrations,
      count: integrations.length
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch integrations'
    }, { status: 500 })
  }
}

// POST - Create new integration or test connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, integration, config } = body

    if (action === 'test_connection') {
      return await testIntegrationConnection(integration.type, config)
    }

    if (action === 'create') {
      return await createIntegration(integration)
    }

    if (action === 'sync') {
      return await syncIntegration(integration.id)
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
  } catch (error) {
    console.error('Error processing integration request:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 })
  }
}

// PUT - Update existing integration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, updates } = body

    // Mock update - in real app would update database
    const integration = mockIntegrations.find(i => i.id === id)
    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 })
    }

    Object.assign(integration, updates, {
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'Integration updated successfully'
    })
  } catch (error) {
    console.error('Error updating integration:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update integration'
    }, { status: 500 })
  }
}

// DELETE - Remove integration
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Integration ID is required'
      }, { status: 400 })
    }

    // Mock deletion - in real app would delete from database
    const index = mockIntegrations.findIndex(i => i.id === id)
    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 })
    }

    mockIntegrations.splice(index, 1)

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting integration:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete integration'
    }, { status: 500 })
  }
}

async function testIntegrationConnection(type: string, config: any) {
  try {
    let result

    switch (type) {
      case 'billing':
        const billingService = createBillingService(config)
        result = await billingService.testConnection()
        break
      
      case 'court_filing':
        const courtService = createCourtFilingService(config)
        result = await courtService.testConnection()
        break
      
      case 'legal_research':
        const researchService = createLegalResearchService(config)
        result = await researchService.testConnection()
        break
      
      case 'calendar':
        const calendarService = createCalendarService(config)
        result = await calendarService.testConnection()
        break
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Unsupported integration type'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: { connectionTest: result }
    })
  } catch (error) {
    console.error('Connection test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed'
    }, { status: 500 })
  }
}

async function createIntegration(integrationData: any) {
  try {
    const newIntegration: Integration = {
      id: `integration_${Date.now()}`,
      ...integrationData,
      status: 'pending',
      credentials_configured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Mock creation - in real app would save to database
    mockIntegrations.push(newIntegration)

    return NextResponse.json({
      success: true,
      data: newIntegration,
      message: 'Integration created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create integration'
    }, { status: 500 })
  }
}

async function syncIntegration(integrationId: string) {
  try {
    const integration = mockIntegrations.find(i => i.id === integrationId)
    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 })
    }

    // Mock sync process
    integration.last_sync = new Date().toISOString()
    integration.updated_at = new Date().toISOString()
    integration.status = 'connected'

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'Integration synced successfully'
    })
  } catch (error) {
    console.error('Error syncing integration:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to sync integration'
    }, { status: 500 })
  }
} 