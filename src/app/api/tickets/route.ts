import { NextRequest, NextResponse } from 'next/server'
import { ticketManager } from '@/lib/tickets/ticket-manager'
import { ticketAI } from '@/lib/ai/ticket-ai-integration'

// Get tickets with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const status = searchParams.get('status')?.split(',') || undefined
    const priority = searchParams.get('priority')?.split(',') || undefined
    const assigned_to = searchParams.get('assigned_to')?.split(',') || undefined
    const category_id = searchParams.get('category_id')?.split(',') || undefined
    const search = searchParams.get('search') || undefined
    const case_id = searchParams.get('case_id') || undefined
    const client_id = searchParams.get('client_id') || undefined
    const sla_breached = searchParams.get('sla_breached') === 'true'
    const sort_field = searchParams.get('sort_field') || 'created_at'
    const sort_direction = searchParams.get('sort_direction') as 'asc' | 'desc' || 'desc'
    
    // This would come from auth context in a real implementation
    const firm_id = 'default_firm'

    const result = await ticketManager.getTickets({
      filter: {
        status,
        priority,
        assigned_to,
        category_id,
        case_id,
        client_id,
        search,
        sla_breached: sla_breached || undefined
      },
      sort: { field: sort_field, direction: sort_direction },
      page,
      limit,
      firm_id
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tickets'
    }, { status: 500 })
  }
}

// Create new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    const firm_id = 'default_firm' // This would come from auth context

    switch (action) {
      case 'create':
        const ticket = await ticketManager.createTicket({
          ...data,
          firm_id
        })
        
        return NextResponse.json({
          success: true,
          data: ticket,
          message: `Ticket ${ticket.ticket_number} created successfully`
        })

      case 'create_from_conversation':
        const { conversation, participants, platform_source, case_id, client_id } = data
        
        const result = await ticketManager.createTicketFromConversation({
          conversation,
          participant_emails: participants,
          platform_source,
          case_id,
          client_id,
          firm_id
        })
        
        return NextResponse.json({
          success: true,
          data: result,
          message: `Ticket ${result.ticket.ticket_number} created from conversation`
        })

      case 'ai_analyze':
        const { content, context } = data
        
        const analysis = await ticketManager.analyzeTicketWithAI(content, context)
        
        return NextResponse.json({
          success: true,
          data: analysis
        })

      case 'ai_process_query':
        const { user_query, conversation_context, existing_ticket_id } = data
        
        const aiResult = await ticketAI.processTicketQuery({
          user_query,
          conversation_context,
          existing_ticket_id,
          firm_id,
          user_id: 'default_user' // This would come from auth context
        })
        
        return NextResponse.json({
          success: true,
          data: aiResult
        })

      case 'bulk_update':
        const { ticket_ids, updates } = data
        
        const updatedTickets = await ticketManager.bulkUpdateTickets(ticket_ids, updates)
        
        return NextResponse.json({
          success: true,
          data: updatedTickets,
          message: `Updated ${updatedTickets.length} tickets`
        })

      case 'suggest_assignment':
        const { ticket_id } = data
        
        const assignmentSuggestion = await ticketAI.suggestTicketAssignment(ticket_id, firm_id)
        
        return NextResponse.json({
          success: true,
          data: assignmentSuggestion
        })

      case 'analyze_priority':
        const priorityAnalysis = await ticketAI.intelligentPrioritization(data.ticket_id)
        
        return NextResponse.json({
          success: true,
          data: priorityAnalysis
        })

      case 'monitor_escalation':
        const escalations = await ticketAI.monitorTicketEscalation(firm_id)
        
        return NextResponse.json({
          success: true,
          data: escalations
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error processing ticket request:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process ticket request'
    }, { status: 500 })
  }
}

// Update ticket
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticket_id, ...updates } = body

    if (!ticket_id) {
      return NextResponse.json({
        success: false,
        error: 'Ticket ID is required'
      }, { status: 400 })
    }

    const updatedTicket = await ticketManager.updateTicket(ticket_id, updates)

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: `Ticket ${updatedTicket.ticket_number} updated successfully`
    })

  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update ticket'
    }, { status: 500 })
  }
} 