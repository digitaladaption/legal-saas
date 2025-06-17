import { NextRequest, NextResponse } from 'next/server'
import { intelligentAgent, EmailDraftRequest } from '@/lib/ai/intelligent-agent'

// Process AI Agent Queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, context, action } = body

    switch (action) {
      case 'process_query':
        const response = await intelligentAgent.processQuery(query, context)
        return NextResponse.json({ 
          success: true, 
          data: response 
        })

      case 'process_email':
        const emailData = body.emailData as EmailDraftRequest
        const emailResponse = await intelligentAgent.processIncomingEmail(emailData)
        return NextResponse.json({ 
          success: true, 
          data: emailResponse 
        })

      case 'legal_research':
        const researchTopic = body.topic || query
        const legalResults = await intelligentAgent.performLegalResearch(researchTopic)
        return NextResponse.json({ 
          success: true, 
          data: legalResults 
        })

      case 'case_analysis':
        const caseParams = body.caseParameters || { case_type: 'general' }
        const caseAnalysis = await intelligentAgent.analyzeCaseSuccess(caseParams)
        return NextResponse.json({ 
          success: true, 
          data: caseAnalysis 
        })

      case 'document_search':
        const searchTerms = body.searchTerms || query
        const searchResults = await intelligentAgent.searchAllDocuments(searchTerms)
        return NextResponse.json({ 
          success: true, 
          data: searchResults 
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Agent API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Get Agent Status and Capabilities
export async function GET() {
  try {
    const status = {
      active: true,
      capabilities: [
        'document_search',
        'legal_research', 
        'case_analysis',
        'email_drafting',
        'task_automation'
      ],
      data_sources: [
        { type: 'internal', status: 'connected' },
        { type: 'google_drive', status: 'available' },
        { type: 'onedrive', status: 'available' },
        { type: 'email', status: 'available' },
        { type: 'slack', status: 'available' }
      ],
      legal_databases: [
        { name: 'BAILII', status: 'available' },
        { name: 'UK Government', status: 'available' },
        { name: 'Case Law Database', status: 'available' }
      ],
      last_updated: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      data: status 
    })

  } catch (error) {
    console.error('Agent Status Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get agent status' 
    }, { status: 500 })
  }
} 